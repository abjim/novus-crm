import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { sign } from 'hono/jwt';
import { compare } from 'bcryptjs'; // Ensure bcryptjs is installed
import { eq } from 'drizzle-orm';
import { createDb } from '../db';
import { users } from '../db/schema';

const auth = new Hono<{ Bindings: { DATABASE_URL: string; JWT_SECRET: string } }>();

auth.post('/login', async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);

  // Find user by email
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = result[0];

  if (!user || !user.isActive) {
    // Generic error message for security
    return c.json({ error: 'Invalid credentials or account inactive' }, 401);
  }

  // Validate password
  const isValid = await compare(password, user.passwordHash);

  if (!isValid) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  // Create JWT Payload
  const payload = {
    id: user.id,
    role: user.role,
    brandIds: user.brandIds,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days expiration
  };

  const token = await sign(payload, c.env.JWT_SECRET);

  // Set HTTP-Only Cookie
  setCookie(c, 'novus_auth', token, {
    httpOnly: true,
    secure: true, // Always secure in production (Vercel Edge implies HTTPS)
    sameSite: 'Strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  // Return success info (excluding sensitive data)
  return c.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      brandIds: user.brandIds,
    },
  });
});

export default auth;
