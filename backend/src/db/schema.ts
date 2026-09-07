import { pgTable, serial, text, varchar, boolean, integer, numeric, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 150 }).notNull(),
  email: varchar('email', { length: 254 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  firstName: varchar('first_name', { length: 150 }).notNull().default(''),
  lastName: varchar('last_name', { length: 150 }).notNull().default(''),
  isVendor: boolean('is_vendor').notNull().default(false),
  isStaff: boolean('is_staff').notNull().default(false),
  isSuperuser: boolean('is_superuser').notNull().default(false),
  phone: varchar('phone', { length: 20 }).notNull().default(''),
  companyName: varchar('company_name', { length: 200 }).notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  uniqueIndex('users_username_idx').on(table.username),
  uniqueIndex('users_email_idx').on(table.email),
])

// C8-style DB-backed sessions (mirrors Django's default session store) —
// no Redis dependency needed for a project this size.
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
})

export const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  address: varchar('address', { length: 300 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 50 }).notNull(),
  zipCode: varchar('zip_code', { length: 10 }).notNull(),
  country: varchar('country', { length: 100 }).notNull().default('United States'),
  price: numeric('price', { precision: 10, scale: 2, mode: 'number' }).notNull(),
  isVendorTerms: boolean('is_vendor_terms').notNull().default(false),
  isDeceasedEstate: boolean('is_deceased_estate').notNull().default(false),
  bedrooms: integer('bedrooms').notNull(),
  bathrooms: numeric('bathrooms', { precision: 3, scale: 1, mode: 'number' }).notNull(),
  squareFeet: integer('square_feet').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('available'), // available | pending | sold
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const propertyImages = pgTable('property_images', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  image: varchar('image', { length: 500 }).notNull(),
  caption: varchar('caption', { length: 200 }).notNull().default(''),
  isPrimary: boolean('is_primary').notNull().default(false),
  uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
})

export const commissions = pgTable('commissions', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id').notNull().unique().references(() => properties.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 10, scale: 2, mode: 'number' }).notNull().default(1000),
  paid: boolean('paid').notNull().default(false),
  paidDate: timestamp('paid_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  vendor: one(users, { fields: [properties.vendorId], references: [users.id] }),
  images: many(propertyImages),
  commission: one(commissions, { fields: [properties.id], references: [commissions.propertyId] }),
}))

export const propertyImagesRelations = relations(propertyImages, ({ one }) => ({
  property: one(properties, { fields: [propertyImages.propertyId], references: [properties.id] }),
}))

export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties),
}))

// Flat-rate commission per sale — kept in one place so routes/properties.ts
// and db/seed.ts can't drift from each other.
export const COMMISSION_FLAT_RATE = 1000.00

// Platform eligibility rule ported from Property.is_eligible() in the old
// Django model.
export const ELIGIBILITY_PRICE_CEILING = 200000
