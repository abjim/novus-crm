import { Context, Next, MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';

// Define the shape of the JWT payload
export type UserPayload = {
  id: string;
  role: 'Agent' | 'Manager' | 'Admin';
  brandIds: string[];
  exp: number;
};

// Define the environment type for Hono
export type HonoEnv = {
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    INGEST_API_KEY: string;
    // Comms Config
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_USER: string;
    SMTP_PASS: string;
    SMS_API_KEY: string;
    SMS_SENDER_ID: string;
    SMS_API_URL: string;
  };
  Variables: {
    user: UserPayload;
  };
};

export const authMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
  // Bypass JWT check for Ingest API (handled by API Key)
  if (c.req.path.startsWith('/api/v1/ingest')) {
    await next();
    return;
  }

  const token = getCookie(c, 'novus_auth');

  if (!token) {
    return c.json({ error: 'Unauthorized: No token provided' }, 401);
  }

  try {
    const secret = c.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not set');
    }

    const payload = await verify(token, secret);
    c.set('user', payload as unknown as UserPayload);
    
    await next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return c.json({ error: 'Unauthorized: Invalid token' }, 401);
  }
};

// RBAC Middleware: Ensures user has access to at least one of the required brands
export const requireBrands = (requiredBrands: string[]): MiddlewareHandler<HonoEnv> => {
  return async (c, next) => {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Admins bypass brand checks
    if (user.role === 'Admin') {
      await next();
      return;
    }

    // Check for intersection between user's brands and required brands
    const hasAccess = user.brandIds.some((brandId) => 
      requiredBrands.includes(brandId)
    );

    if (!hasAccess) {
      return c.json({ 
        error: 'Forbidden: You do not have access to this brand scope',
        required: requiredBrands,
        yours: user.brandIds 
      }, 403);
    }

    await next();
  };
};