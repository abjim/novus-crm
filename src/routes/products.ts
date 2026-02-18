import { Hono } from 'hono';
import { createDb } from '../db';
import { products } from '../db/schema';
import { inArray } from 'drizzle-orm';
import { HonoEnv } from '../middleware/auth';

const productsRoutes = new Hono<HonoEnv>();

// GET /api/v1/products
productsRoutes.get('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const user = c.get('user');

  // Ensure user has brands assigned
  if (!user.brandIds || user.brandIds.length === 0) {
     return c.json({ data: [] });
  }

  // Fetch products belonging to the user's brands
  const result = await db.query.products.findMany({
    where: inArray(products.brandId, user.brandIds),
    orderBy: (products, { asc }) => [asc(products.name)],
  });

  return c.json({ data: result });
});

export default productsRoutes;
