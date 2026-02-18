import { Hono } from 'hono';
import { createTransport } from 'nodemailer';
import { createDb } from '../db';
import { leads, activities } from '../db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { HonoEnv } from '../middleware/auth';

const comms = new Hono<HonoEnv>();

// Helper to validate access to lead
async function getAuthorizedLead(c: any, leadId: string) {
  const db = createDb(c.env.DATABASE_URL);
  const user = c.get('user');

  const lead = await db.query.leads.findFirst({
    where: and(
      eq(leads.id, leadId),
      inArray(leads.brandId, user.brandIds)
    )
  });
  
  return { db, lead, user };
}

// POST /api/v1/comms/email
comms.post('/email', async (c) => {
  const body = await c.req.json();
  const { lead_id, subject, body_html } = body;

  if (!lead_id || !subject || !body_html) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  const { db, lead, user } = await getAuthorizedLead(c, lead_id);

  if (!lead) {
    return c.json({ error: 'Lead not found or access denied' }, 404);
  }

  if (!lead.email) {
    return c.json({ error: 'Lead does not have an email address' }, 400);
  }

  try {
    // 1. Configure Transporter
    const transporter = createTransport({
      host: c.env.SMTP_HOST,
      port: parseInt(c.env.SMTP_PORT || '465'),
      secure: true, // true for 465, false for other ports
      auth: {
        user: c.env.SMTP_USER,
        pass: c.env.SMTP_PASS,
      },
    });

    // 2. Send Email
    const info = await transporter.sendMail({
      from: `"${user.role}" <${c.env.SMTP_USER}>`,
      to: lead.email,
      subject: subject,
      html: body_html,
    });

    // 3. Log Activity
    await db.insert(activities).values({
      leadId: lead.id,
      userId: user.id,
      type: 'email',
      contentRich: JSON.stringify({
        subject,
        messageId: info.messageId,
        preview: body_html.substring(0, 100) + '...',
        status: 'Sent'
      })
    });

    return c.json({ success: true, messageId: info.messageId });

  } catch (error: any) {
    console.error('Email Send Error:', error);
    return c.json({ error: 'Failed to send email', details: error.message }, 500);
  }
});

// POST /api/v1/comms/sms
comms.post('/sms', async (c) => {
  const body = await c.req.json();
  const { lead_id, message } = body;

  if (!lead_id || !message) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  const { db, lead, user } = await getAuthorizedLead(c, lead_id);

  if (!lead) {
    return c.json({ error: 'Lead not found or access denied' }, 404);
  }

  if (!lead.mobile) {
    return c.json({ error: 'Lead does not have a mobile number' }, 400);
  }

  try {
    // 1. Prepare BulkSMSBD Payload
    const apiKey = c.env.SMS_API_KEY;
    const senderId = c.env.SMS_SENDER_ID;
    const apiUrl = c.env.SMS_API_URL || 'http://bulksmsbd.net/api/smsapi';
    
    // Construct params for standard gateway request
    const params = new URLSearchParams({
      api_key: apiKey,
      type: 'text',
      number: lead.mobile,
      senderid: senderId,
      message: message
    });

    // 2. Native Fetch Call
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const responseText = await response.text();

    // 3. Log Activity
    await db.insert(activities).values({
      leadId: lead.id,
      userId: user.id,
      type: 'sms',
      contentRich: JSON.stringify({
        message,
        gateway_response: responseText,
        status: response.ok ? 'Sent' : 'Failed'
      })
    });

    return c.json({ success: true, gateway_response: responseText });

  } catch (error: any) {
    console.error('SMS Send Error:', error);
    return c.json({ error: 'Failed to send SMS', details: error.message }, 500);
  }
});

export default comms;
