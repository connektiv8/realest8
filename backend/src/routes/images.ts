import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { propertyImages } from '../db/schema.js'
import { attachUser, requireAuth } from '../middleware/requireAuth.js'

const app = new Hono()
app.use('*', attachUser)

function serialize(row: typeof propertyImages.$inferSelect) {
  return {
    id: row.id,
    image: row.image,
    caption: row.caption,
    is_primary: row.isPrimary,
    uploaded_at: row.uploadedAt,
  }
}

// GET /api/listings/images/
app.get('/images/', async (c) => {
  const rows = await db.select().from(propertyImages)
  return c.json({ count: rows.length, next: null, previous: null, results: rows.map(serialize) })
})

const imageWriteSchema = z.object({
  property: z.number().int(),
  image: z.string().url(),
  caption: z.string().optional().default(''),
  is_primary: z.boolean().optional().default(false),
})

// POST /api/listings/images/
// Matches the original PropertyImageViewSet: any authenticated user (not
// just the owning vendor) may add images — preserved as-is for parity.
app.post('/images/', requireAuth, zValidator('json', imageWriteSchema), async (c) => {
  const body = c.req.valid('json')
  const [created] = await db.insert(propertyImages).values({
    propertyId: body.property,
    image: body.image,
    caption: body.caption,
    isPrimary: body.is_primary,
  }).returning()
  return c.json(serialize(created), 201)
})

const imageUpdateSchema = imageWriteSchema.partial()

// PUT /api/listings/images/:id/
app.put('/images/:id{[0-9]+}/', requireAuth, zValidator('json', imageUpdateSchema), async (c) => {
  const id = Number(c.req.param('id'))
  const body = c.req.valid('json')

  const [updated] = await db.update(propertyImages).set({
    ...(body.property !== undefined && { propertyId: body.property }),
    ...(body.image !== undefined && { image: body.image }),
    ...(body.caption !== undefined && { caption: body.caption }),
    ...(body.is_primary !== undefined && { isPrimary: body.is_primary }),
  }).where(eq(propertyImages.id, id)).returning()

  if (!updated) return c.json({ detail: 'Not found.' }, 404)
  return c.json(serialize(updated))
})

// DELETE /api/listings/images/:id/
app.delete('/images/:id{[0-9]+}/', requireAuth, async (c) => {
  const id = Number(c.req.param('id'))
  const [deleted] = await db.delete(propertyImages).where(eq(propertyImages.id, id)).returning({ id: propertyImages.id })
  if (!deleted) return c.json({ detail: 'Not found.' }, 404)
  return c.body(null, 204)
})

export default app
