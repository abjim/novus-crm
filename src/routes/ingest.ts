import { Hono } from 'hono';
import { createDb } from '../db';
import { leads, activities } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { HonoEnv } from '../middleware/auth';

const ingest = new Hono<HonoEnv>();

ingest.post('/events', async (c) => {
  // 1. Bearer Token Auth Validation
  const authHeader = c.req.header('Authorization');
  const apiKey = c.env.INGEST_API_KEY;

  if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
    return c.json({ error: 'Unauthorized: Invalid API Key' }, 401);
  }

  // 2. Parse & Validate Payload
  let body;
  try {
    body = await c.req.json();
  } catch (e) {
    return c.json({ error: 'Invalid JSON payload' }, 400);
  }

  const { client_event_id, email, event_type, metadata } = body;

  if (!email || !event_type) {
    return c.json({ error: 'Missing required fields: email, event_type' }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);

  // 3. Find Lead by Email
  const lead = await db.query.leads.findFirst({
    where: eq(leads.email, email)
  });

  if (!lead) {
    // We return 404 if the lead doesn't exist, as we can't attribute the event
    return c.json({ message: 'Lead not found, event ignored' }, 404);
  }

  // 4. Calculate Score Delta
  let scoreDelta = 0;
  let activityType = 'system';
  
  switch (event_type) {
    case 'course_completed':
      scoreDelta = 15;
      break;
    case 'cart_abandoned':
      scoreDelta = 5;
      break;
    case 'email_opened':
      scoreDelta = 1;
      break;
    default:
      scoreDelta = 0;
  }

  // 5. Transaction: Insert Activity & Update Score
  try {
    await db.transaction(async (tx) => {
      // Insert Activity Log
      await tx.insert(activities).values({
        leadId: lead.id,
        userId: null, // System event
        type: 'system',
        contentRich: JSON.stringify({
          title: `Event: ${event_type}`,
          score_change: scoreDelta > 0 ? `+${scoreDelta}` : '0',
          client_event_id,
          metadata: metadata || {}
        }, null, 2),
      });

      // Increment Engagement Score
      if (scoreDelta > 0) {
        await tx.update(leads)
          .set({
            engagementScore: sql`${leads.engagementScore} + ${scoreDelta}`,
            updatedAt: new Date(),
          })
          .where(eq(leads.id, lead.id));
      }
    });

    return c.json({ success: true, message: 'Event ingested successfully' });

  } catch (error) {
    console.error('Ingestion Error:', error);
    return c.json({ error: 'Internal Server Error processing event' }, 500);
  }
});

export default ingest;
