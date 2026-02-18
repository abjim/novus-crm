import { Hono } from 'hono';
import { createDb } from '../db';
import { deals, leads, products, auditLogs } from '../db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { HonoEnv } from '../middleware/auth';

const dealsRoutes = new Hono<HonoEnv>();

/**
 * Utility to calculate EMI Schedule
 * Splits totalAmount into 'months' equal parts, handling remainder in the last installment.
 */
const calculateEmiSchedule = (totalAmount: number, months: number) => {
  const schedule = [];
  const baseInstallment = Math.floor(totalAmount / months);
  let currentSum = 0;

  for (let i = 0; i < months; i++) {
    const date = new Date();
    date.setDate(date.getDate() + (30 * (i + 1))); // Simple 30-day interval logic

    let amount = baseInstallment;
    
    // Adjust last installment to capture any remainder
    if (i === months - 1) {
      amount = totalAmount - currentSum;
    } else {
      currentSum += amount;
    }

    schedule.push({
      due_date: date.toISOString().split('T')[0],
      amount: amount,
      status: 'pending'
    });
  }
  return schedule;
};

// POST /api/v1/deals
dealsRoutes.post('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const user = c.get('user');
  
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  const { lead_id, sku_id, payment_model, emi_months } = body;

  if (!lead_id || !sku_id || !payment_model) {
    return c.json({ error: 'Missing required fields: lead_id, sku_id, payment_model' }, 400);
  }

  // 1. Fetch Product (Verify Brand Access indirectly via Lead check, or explicitly here)
  // We check if product is accessible to the user
  const product = await db.query.products.findFirst({
    where: and(
      eq(products.id, sku_id),
      inArray(products.brandId, user.brandIds)
    )
  });

  if (!product) {
    return c.json({ error: 'Product not found or access denied' }, 404);
  }

  // 2. Fetch Lead (Verify Brand Access)
  const lead = await db.query.leads.findFirst({
    where: and(
      eq(leads.id, lead_id),
      inArray(leads.brandId, user.brandIds)
    )
  });

  if (!lead) {
    return c.json({ error: 'Lead not found or access denied' }, 404);
  }

  // 3. Prepare Deal Data
  const dealAmount = product.basePrice;
  let emiSchedule = null;

  if (payment_model === 'EMI') {
    const months = parseInt(emi_months) || 3;
    if (months < 2) {
      return c.json({ error: 'EMI months must be at least 2' }, 400);
    }
    emiSchedule = calculateEmiSchedule(dealAmount, months);
  }

  // 4. Atomic Transaction: Create Deal + Update Lead -> Won
  try {
    const result = await db.transaction(async (tx) => {
      // Insert Deal
      const [newDeal] = await tx.insert(deals).values({
        leadId: lead_id,
        skuId: sku_id,
        amount: dealAmount,
        emiSchedule: emiSchedule,
        status: 'open', // Deal is open until paid, though Lead is Won
      }).returning();

      // Update Lead Status
      await tx.update(leads)
        .set({ 
          qualificationStage: 'Won',
          updatedAt: new Date()
        })
        .where(eq(leads.id, lead_id));

      // Audit Log
      await tx.insert(auditLogs).values({
        tableName: 'deals',
        recordId: newDeal.id,
        action: 'CREATE',
        changes: { 
          lead_id, 
          sku_id, 
          payment_model, 
          amount: dealAmount,
          lead_stage_update: 'Won' 
        },
        performedBy: user.id
      });

      return newDeal;
    });

    return c.json({ success: true, data: result });

  } catch (error) {
    console.error('Deal Creation Transaction Error:', error);
    return c.json({ error: 'Failed to process deal' }, 500);
  }
});

export default dealsRoutes;
