import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { and, eq, gte, lte, ilike, or, asc, desc, type SQL } from 'drizzle-orm'
import { db } from '../db/client.js'
import { properties, propertyImages, commissions, users, COMMISSION_FLAT_RATE, ELIGIBILITY_PRICE_CEILING } from '../db/schema.js'
import { attachUser, requireAuth } from '../middleware/requireAuth.js'
import type { AuthedUser } from '../lib/session.js'

const app = new Hono()
app.use('*', attachUser)

function isEligible(price: number, isVendorTerms: boolean) {
  return price <= ELIGIBILITY_PRICE_CEILING || isVendorTerms
}

const ORDERABLE_FIELDS = {
  price: properties.price,
  created_at: properties.createdAt,
  bedrooms: properties.bedrooms,
  bathrooms: properties.bathrooms,
} as const

function parseOrdering(raw: string | undefined): SQL {
  const field = raw?.replace(/^-/, '') as keyof typeof ORDERABLE_FIELDS | undefined
  const column = (field && ORDERABLE_FIELDS[field]) || properties.createdAt
  return raw?.startsWith('-') || !raw ? desc(column) : asc(column)
}

// Only vendors may create; only the owning vendor may edit/delete their own
// listing — ported from listings/views.py's IsVendorOrReadOnly.
function assertCanWrite(user: AuthedUser | null) {
  if (!user || !user.isVendor) return { detail: 'Only vendors can perform this action.' } as const
  return null
}

async function serializeImages(propertyId: number) {
  return db.select({
    id: propertyImages.id,
    image: propertyImages.image,
    caption: propertyImages.caption,
    is_primary: propertyImages.isPrimary,
    uploaded_at: propertyImages.uploadedAt,
  }).from(propertyImages).where(eq(propertyImages.propertyId, propertyId)).orderBy(desc(propertyImages.isPrimary), asc(propertyImages.uploadedAt))
}

async function serializeCommission(propertyId: number) {
  const [row] = await db.select({
    id: commissions.id,
    amount: commissions.amount,
    paid: commissions.paid,
    paid_date: commissions.paidDate,
    created_at: commissions.createdAt,
  }).from(commissions).where(eq(commissions.propertyId, propertyId)).limit(1)
  return row ?? null
}

async function serializeDetail(row: typeof properties.$inferSelect & { vendorName: string }) {
  return {
    id: row.id,
    vendor: row.vendorId,
    vendor_name: row.vendorName,
    title: row.title,
    description: row.description,
    address: row.address,
    city: row.city,
    state: row.state,
    zip_code: row.zipCode,
    country: row.country,
    price: row.price,
    is_vendor_terms: row.isVendorTerms,
    is_deceased_estate: row.isDeceasedEstate,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    square_feet: row.squareFeet,
    status: row.status,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    images: await serializeImages(row.id),
    commission: await serializeCommission(row.id),
    is_eligible: isEligible(row.price, row.isVendorTerms),
  }
}

async function serializeListItem(row: typeof properties.$inferSelect & { vendorName: string }) {
  const images = await serializeImages(row.id)
  const primary = images.find((i) => i.is_primary) ?? images[0]
  return {
    id: row.id,
    vendor_name: row.vendorName,
    title: row.title,
    address: row.address,
    city: row.city,
    state: row.state,
    country: row.country,
    price: row.price,
    is_vendor_terms: row.isVendorTerms,
    is_deceased_estate: row.isDeceasedEstate,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    square_feet: row.squareFeet,
    status: row.status,
    primary_image: primary?.image ?? null,
  }
}

// GET /api/listings/properties/
app.get('/properties/', async (c) => {
  const q = c.req.query()
  const user = c.get('user')

  const conditions: SQL[] = []
  if (q.max_price) conditions.push(lte(properties.price, Number(q.max_price)))
  if (q.min_price) conditions.push(gte(properties.price, Number(q.min_price)))
  if (q.is_vendor_terms !== undefined) conditions.push(eq(properties.isVendorTerms, q.is_vendor_terms === 'true'))
  if (q.is_deceased_estate !== undefined) conditions.push(eq(properties.isDeceasedEstate, q.is_deceased_estate === 'true'))
  if (q.city) conditions.push(eq(properties.city, q.city))
  if (q.state) conditions.push(eq(properties.state, q.state))
  if (q.status) conditions.push(eq(properties.status, q.status))
  if (q.search) {
    const term = `%${q.search}%`
    conditions.push(or(
      ilike(properties.title, term),
      ilike(properties.description, term),
      ilike(properties.address, term),
      ilike(properties.city, term),
    )!)
  }

  // Public/non-vendor visitors only ever see available listings — vendors
  // (any vendor, not just the owner) see everything, matching the original
  // get_queryset() behaviour.
  if (!user || !user.isVendor) conditions.push(eq(properties.status, 'available'))

  const PAGE_SIZE = 20
  const page = Math.max(1, Number(q.page ?? 1))

  const rows = await db.select({
    property: properties,
    vendorName: users.firstName,
    vendorLastName: users.lastName,
  }).from(properties)
    .innerJoin(users, eq(properties.vendorId, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(parseOrdering(q.ordering))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE)

  const results = await Promise.all(rows.map((r) =>
    serializeListItem({ ...r.property, vendorName: `${r.vendorName} ${r.vendorLastName}`.trim() })
  ))

  return c.json({ count: results.length, next: null, previous: null, results })
})

// GET /api/listings/properties/my_listings/  (must be registered before /:id/)
app.get('/properties/my_listings/', requireAuth, async (c) => {
  const user = c.get('user')!

  const conditions: SQL[] = []
  if (!user.isStaff && !user.isSuperuser) {
    if (!user.isVendor) return c.json({ detail: 'Only vendors can access this endpoint.' }, 403)
    conditions.push(eq(properties.vendorId, user.id))
  }

  const rows = await db.select({
    property: properties,
    vendorName: users.firstName,
    vendorLastName: users.lastName,
  }).from(properties)
    .innerJoin(users, eq(properties.vendorId, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(properties.createdAt))

  const results = await Promise.all(rows.map((r) =>
    serializeListItem({ ...r.property, vendorName: `${r.vendorName} ${r.vendorLastName}`.trim() })
  ))
  return c.json(results)
})

async function loadDetail(id: number) {
  const [row] = await db.select({
    property: properties,
    vendorName: users.firstName,
    vendorLastName: users.lastName,
  }).from(properties)
    .innerJoin(users, eq(properties.vendorId, users.id))
    .where(eq(properties.id, id))
    .limit(1)
  if (!row) return null
  return serializeDetail({ ...row.property, vendorName: `${row.vendorName} ${row.vendorLastName}`.trim() })
}

// GET /api/listings/properties/:id/
app.get('/properties/:id{[0-9]+}/', async (c) => {
  const detail = await loadDetail(Number(c.req.param('id')))
  if (!detail) return c.json({ detail: 'Not found.' }, 404)
  return c.json(detail)
})

const priceRule = (data: { price: number; is_vendor_terms?: boolean }) =>
  data.price <= ELIGIBILITY_PRICE_CEILING || data.is_vendor_terms === true

const propertyBaseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip_code: z.string().min(1),
  country: z.string().optional().default('United States'),
  price: z.number().min(0),
  is_vendor_terms: z.boolean().optional().default(false),
  is_deceased_estate: z.boolean().optional().default(false),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().min(0),
  square_feet: z.number().int().min(0),
  status: z.enum(['available', 'pending', 'sold']).optional().default('available'),
})

const propertyWriteSchema = propertyBaseSchema.refine(priceRule, {
  message: 'Properties over $200,000 must be available on vendor terms.',
  path: ['price'],
})

// POST /api/listings/properties/
app.post('/properties/', requireAuth, zValidator('json', propertyWriteSchema), async (c) => {
  const forbidden = assertCanWrite(c.get('user'))
  if (forbidden) return c.json(forbidden, 403)

  const user = c.get('user')!
  const body = c.req.valid('json')

  const [created] = await db.insert(properties).values({
    vendorId: user.id,
    title: body.title,
    description: body.description,
    address: body.address,
    city: body.city,
    state: body.state,
    zipCode: body.zip_code,
    country: body.country,
    price: body.price,
    isVendorTerms: body.is_vendor_terms,
    isDeceasedEstate: body.is_deceased_estate,
    bedrooms: body.bedrooms,
    bathrooms: body.bathrooms,
    squareFeet: body.square_feet,
    status: body.status,
  }).returning()

  // Commission is auto-created per sale, flat rate — amount is never
  // client-settable (see COMMISSION_FLAT_RATE in db/schema.ts).
  await db.insert(commissions).values({ propertyId: created.id, amount: COMMISSION_FLAT_RATE })

  const detail = await loadDetail(created.id)
  return c.json(detail, 201)
})

const propertyUpdateSchema = propertyBaseSchema.partial().refine(
  (data) => data.price === undefined || priceRule({ price: data.price, is_vendor_terms: data.is_vendor_terms }),
  { message: 'Properties over $200,000 must be available on vendor terms.', path: ['price'] },
)

// PUT /api/listings/properties/:id/
app.put('/properties/:id{[0-9]+}/', requireAuth, zValidator('json', propertyUpdateSchema), async (c) => {
  const id = Number(c.req.param('id'))
  const user = c.get('user')!

  const [existing] = await db.select().from(properties).where(eq(properties.id, id)).limit(1)
  if (!existing) return c.json({ detail: 'Not found.' }, 404)
  if (existing.vendorId !== user.id) return c.json({ detail: 'You do not have permission to perform this action.' }, 403)

  const body = c.req.valid('json')
  await db.update(properties).set({
    ...(body.title !== undefined && { title: body.title }),
    ...(body.description !== undefined && { description: body.description }),
    ...(body.address !== undefined && { address: body.address }),
    ...(body.city !== undefined && { city: body.city }),
    ...(body.state !== undefined && { state: body.state }),
    ...(body.zip_code !== undefined && { zipCode: body.zip_code }),
    ...(body.country !== undefined && { country: body.country }),
    ...(body.price !== undefined && { price: body.price }),
    ...(body.is_vendor_terms !== undefined && { isVendorTerms: body.is_vendor_terms }),
    ...(body.is_deceased_estate !== undefined && { isDeceasedEstate: body.is_deceased_estate }),
    ...(body.bedrooms !== undefined && { bedrooms: body.bedrooms }),
    ...(body.bathrooms !== undefined && { bathrooms: body.bathrooms }),
    ...(body.square_feet !== undefined && { squareFeet: body.square_feet }),
    ...(body.status !== undefined && { status: body.status }),
    updatedAt: new Date(),
  }).where(eq(properties.id, id))

  return c.json(await loadDetail(id))
})

// DELETE /api/listings/properties/:id/
app.delete('/properties/:id{[0-9]+}/', requireAuth, async (c) => {
  const id = Number(c.req.param('id'))
  const user = c.get('user')!

  const [existing] = await db.select().from(properties).where(eq(properties.id, id)).limit(1)
  if (!existing) return c.json({ detail: 'Not found.' }, 404)
  if (existing.vendorId !== user.id) return c.json({ detail: 'You do not have permission to perform this action.' }, 403)

  await db.delete(properties).where(eq(properties.id, id))
  return c.body(null, 204)
})

export default app
