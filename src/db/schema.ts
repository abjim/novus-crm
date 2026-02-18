import { pgTable, uuid, text, integer, boolean, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- Enums ---
export const userRoleEnum = pgEnum('user_role', ['Agent', 'Manager', 'Admin']);
export const qualificationStageEnum = pgEnum('qualification_stage', [
  'Raw', 
  'IQL', 
  'MQL', 
  'SAL', 
  'SQL', 
  'Won', 
  'Lost'
]);
export const activityTypeEnum = pgEnum('activity_type', ['note', 'email', 'sms', 'system']);
export const productStatusEnum = pgEnum('product_status', ['active', 'draft', 'archived']);
export const dealStatusEnum = pgEnum('deal_status', ['open', 'won', 'lost']);

// --- Users Table ---
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').default('Agent').notNull(),
  brandIds: text('brand_ids').array().notNull(), // PostgreSQL text[] for brand isolation
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Products Table ---
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  brandId: text('brand_id').notNull(), // Brand identifier (e.g., 'LB', 'SP')
  skuCode: text('sku_code').notNull().unique(),
  name: text('name').notNull(),
  basePrice: integer('base_price').notNull(), // Stored in cents/paisa to avoid floating point errors
  pricingTiers: jsonb('pricing_tiers').$type<any>().notNull(), // Flexible JSON for Fixed/EMI/Bundle configs
  status: productStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Leads Table ---
export const leads = pgTable('leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  brandId: text('brand_id').notNull(),
  name: text('name').notNull(),
  mobile: text('mobile').notNull(),
  email: text('email'),
  qualificationStage: qualificationStageEnum('qualification_stage').default('Raw').notNull(),
  engagementScore: integer('engagement_score').default(0).notNull(),
  fitScore: integer('fit_score').default(0).notNull(),
  assignedTo: uuid('assigned_to').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Deals Table ---
export const deals = pgTable('deals', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadId: uuid('lead_id').references(() => leads.id).notNull(),
  skuId: uuid('sku_id').references(() => products.id).notNull(),
  amount: integer('amount').notNull(), // Final deal value
  emiSchedule: jsonb('emi_schedule').$type<any>(), // Structure for installment dates/amounts
  status: dealStatusEnum('status').default('open').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Activities Table ---
export const activities = pgTable('activities', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadId: uuid('lead_id').references(() => leads.id).notNull(),
  userId: uuid('user_id').references(() => users.id), // Nullable for system events
  type: activityTypeEnum('type').notNull(),
  contentRich: text('content_rich').notNull(), // HTML or Markdown content
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- Audit Logs Table ---
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tableName: text('table_name').notNull(),
  recordId: uuid('record_id').notNull(),
  action: text('action').notNull(), // UPDATE, CREATE, DELETE
  changes: jsonb('changes').$type<any>().notNull(), // JSON diff
  performedBy: uuid('performed_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- Relations ---

export const usersRelations = relations(users, ({ many }) => ({
  leads: many(leads, { relationName: 'agent_leads' }),
  activities: many(activities),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  assignedAgent: one(users, {
    fields: [leads.assignedTo],
    references: [users.id],
    relationName: 'agent_leads',
  }),
  deals: many(deals),
  activities: many(activities),
}));

export const productsRelations = relations(products, ({ many }) => ({
  deals: many(deals),
}));

export const dealsRelations = relations(deals, ({ one }) => ({
  lead: one(leads, {
    fields: [deals.leadId],
    references: [leads.id],
  }),
  product: one(products, {
    fields: [deals.skuId],
    references: [products.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  lead: one(leads, {
    fields: [activities.leadId],
    references: [leads.id],
  }),
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));
