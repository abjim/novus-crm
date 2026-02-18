import { Hono } from 'hono';
import { cors } from 'hono/cors';
import authRoutes from './routes/auth';
import leadsRoutes from './routes/leads';
import ingestRoutes from './routes/ingest';
import productsRoutes from './routes/products';
import dealsRoutes from './routes/deals';
import commsRoutes from './routes/comms';
import { authMiddleware, HonoEnv } from './middleware/auth';

const app = new Hono<HonoEnv>();

// Global Middleware
app.use('/*', cors()); // Configure specific origins in production

// Public Routes
app.route('/api/auth', authRoutes);

// Ingestion Routes (Protected by API Key, excluded from JWT middleware)
app.route('/api/v1/ingest', ingestRoutes);

// Protected Routes (Applied to all /api/v1/*, excluding ingest via middleware logic)
app.use('/api/v1/*', authMiddleware);

// Feature Routes
app.route('/api/v1/leads', leadsRoutes);
app.route('/api/v1/products', productsRoutes);
app.route('/api/v1/deals', dealsRoutes);
app.route('/api/v1/comms', commsRoutes);

// Example Protected Route
app.get('/api/v1/me', (c) => {
  const user = c.get('user');
  return c.json({ message: 'You are authenticated', user });
});

// Root Health Check
app.get('/', (c) => {
  return c.json({ status: 'ok', service: 'NOVUS CRM Backend' });
});

export default app;