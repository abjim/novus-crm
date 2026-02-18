import { Hono } from 'hono';
import { createDb } from '../db';
import { leads, auditLogs } from '../db/schema';
import { eq, and, inArray, sql, desc, count } from 'drizzle-orm';
import { HonoEnv } from '../middleware/auth';

const leadsRoutes = new Hono<HonoEnv>();

// GET /api/v1/leads
// Fetch paginated, filtered, and sorted leads with strict brand isolation
leadsRoutes.get('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const user = c.get('user');
  
  // Query Parameters
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;
  const stage = c.req.query('stage');
  const sortByHeat = c.req.query('sort') === 'heat'; // Sort by engagement + fit score

  // Authorization Check: User must have brands assigned
  if (!user.brandIds || user.brandIds.length === 0) {
    return c.json({ data: [], meta: { total: 0, page, limit } });
  }

  // Build Where Clause
  const whereConditions = [
    inArray(leads.brandId, user.brandIds) // Strict Data Isolation
  ];

  if (stage) {
    // Cast string to enum type for Drizzle comparison
    whereConditions.push(eq(leads.qualificationStage, stage as any));
  }

  // Execute Query
  const data = await db.query.leads.findMany({
    where: and(...whereConditions),
    limit: limit,
    offset: offset,
    orderBy: sortByHeat 
      ? [desc(sql`${leads.engagementScore} + ${leads.fitScore}`)] // Dynamic Heat Score sorting
      : [desc(leads.createdAt)],
    with: {
      assignedAgent: {
        columns: {
          id: true,
          email: true,
        }
      }
    }
  });

  // Get Total Count for Pagination
  // Note: count() in Drizzle is often done via a separate query for efficiency
  const totalResult = await db
    .select({ count: count() })
    .from(leads)
    .where(and(...whereConditions));
    
  const total = totalResult[0]?.count || 0;

  return c.json({
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// GET /api/v1/leads/:id
// Fetch single lead with joined activities and deals
leadsRoutes.get('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const user = c.get('user');
  const leadId = c.req.param('id');

  const lead = await db.query.leads.findFirst({
    where: and(
      eq(leads.id, leadId),
      inArray(leads.brandId, user.brandIds) // Ensure user owns the brand of this lead
    ),
    with: {
      activities: {
        orderBy: (activities, { desc }) => [desc(activities.createdAt)],
        with: {
          user: {
            columns: {
              email: true,
            }
          }
        }
      },
      deals: {
        orderBy: (deals, { desc }) => [desc(deals.createdAt)],
        with: {
            product: {
                columns: {
                    name: true,
                    skuCode: true
                }
            }
        }
      },
      assignedAgent: {
        columns: {
          id: true,
          email: true
        }
      }
    }
  });

  if (!lead) {
    return c.json({ error: 'Lead not found or access denied' }, 404);
  }

  return c.json({ data: lead });
});

// PATCH /api/v1/leads/:id
// Update lead and log changes to audit_logs
leadsRoutes.patch('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const user = c.get('user');
  const leadId = c.req.param('id');
  const body = await c.req.json();

  // 1. Fetch existing lead to verify access and get original data
  const existingLead = await db.query.leads.findFirst({
    where: and(
      eq(leads.id, leadId),
      inArray(leads.brandId, user.brandIds)
    )
  });

  if (!existingLead) {
    return c.json({ error: 'Lead not found or access denied' }, 404);
  }

  // 2. Filter allowed fields to update
  const allowedFields = ['name', 'mobile', 'email', 'qualificationStage', 'engagementScore', 'fitScore', 'assignedTo'];
  const updateData: Record<string, any> = {};
  
  // Calculate Diff for Audit Log
  const diff: Record<string, { old: any, new: any }> = {};
  let hasChanges = false;

  for (const key of allowedFields) {
    if (body[key] !== undefined && body[key] !== (existingLead as any)[key]) {
      updateData[key] = body[key];
      diff[key] = {
        old: (existingLead as any)[key],
        new: body[key]
      };
      hasChanges = true;
    }
  }

  if (!hasChanges) {
    return c.json({ message: 'No changes detected', data: existingLead });
  }

  updateData.updatedAt = new Date();

  // 3. Perform Transaction: Update Lead + Insert Audit Log
  try {
    const updatedLead = await db.transaction(async (tx) => {
      // Update Lead
      const [result] = await tx
        .update(leads)
        .set(updateData)
        .where(eq(leads.id, leadId))
        .returning();

      // Insert Audit Log
      await tx.insert(auditLogs).values({
        tableName: 'leads',
        recordId: leadId,
        action: 'UPDATE',
        changes: diff,
        performedBy: user.id
      });

      return result;
    });

    return c.json({ 
      success: true, 
      data: updatedLead,
      changes: diff
    });

  } catch (error) {
    console.error('Update Failed:', error);
    return c.json({ error: 'Failed to update lead' }, 500);
  }
});

export default leadsRoutes;
