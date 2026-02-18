import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// This function allows us to create the db instance with the environment variable
// passed from the Hono context at runtime (required for Cloudflare/Vercel Edge)
export const createDb = (connectionString: string) => {
  const client = neon(connectionString);
  return drizzle(client, { schema });
};
