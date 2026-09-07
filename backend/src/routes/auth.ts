import { Hono, type Context } from 'hono'
import { setCookie, getCookie, deleteCookie } from 'hono/cookie'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { users } from '../db/schema.js'
import { hashPassword, verifyPassword } from '../lib/password.js'
import { createSession, deleteSession } from '../lib/session.js'
import { requireAuth } from '../middleware/requireAuth.js'

const app = new Hono()

const SESSION_COOKIE = 'session'
const isProd = process.env.NODE_ENV === 'production'

function setSessionCookie(c: Context, sessionId: string, expiresAt: Date) {
  setCookie(c, SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'Lax',
    path: '/',
    expires: expiresAt,
  })
}

// Accepts any row shape carrying these camelCase fields — a users table row
// (which also has passwordHash/createdAt, simply ignored here) or an
// AuthedUser from the session lookup both satisfy this.
function serializeUser(user: {
  id: number; username: string; email: string; firstName: string; lastName: string
  isVendor: boolean; isStaff: boolean; isSuperuser: boolean; phone: string; companyName: string
}) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    is_vendor: user.isVendor,
    is_staff: user.isStaff,
    is_superuser: user.isSuperuser,
    phone: user.phone,
    company_name: user.companyName,
  }
}

const registerSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string().optional().default(''),
  last_name: z.string().optional().default(''),
  is_vendor: z.boolean().optional().default(false),
  phone: z.string().optional().default(''),
  company_name: z.string().optional().default(''),
})

// POST /api/accounts/register/
app.post('/accounts/register/', zValidator('json', registerSchema), async (c) => {
  const body = c.req.valid('json')

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.username, body.username)).limit(1)
  if (existing) return c.json({ username: ['A user with that username already exists.'] }, 400)

  const passwordHash = await hashPassword(body.password)
  const [created] = await db.insert(users).values({
    username: body.username,
    email: body.email,
    passwordHash,
    firstName: body.first_name,
    lastName: body.last_name,
    isVendor: body.is_vendor,
    phone: body.phone,
    companyName: body.company_name,
  }).returning()

  return c.json(serializeUser(created), 201)
})

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

// POST /api/auth/login/
app.post('/auth/login/', zValidator('json', loginSchema), async (c) => {
  const { username, password } = c.req.valid('json')

  const [row] = await db.select().from(users).where(eq(users.username, username)).limit(1)
  if (!row || !(await verifyPassword(password, row.passwordHash))) {
    return c.json({ detail: 'Unable to log in with provided credentials.' }, 400)
  }

  const { id: sessionId, expiresAt } = await createSession(row.id)
  setSessionCookie(c, sessionId, expiresAt)

  return c.json(serializeUser(row))
})

// POST /api/auth/logout/
app.post('/auth/logout/', async (c) => {
  const sessionId = getCookie(c, SESSION_COOKIE)
  if (sessionId) await deleteSession(sessionId)
  deleteCookie(c, SESSION_COOKIE, { path: '/' })
  return c.body(null, 204)
})

// GET/PUT /api/accounts/profile/
app.get('/accounts/profile/', requireAuth, async (c) => {
  return c.json(serializeUser(c.get('user')!))
})

const profileUpdateSchema = z.object({
  username: z.string().min(1).optional(),
  email: z.string().email().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  is_vendor: z.boolean().optional(),
  phone: z.string().optional(),
  company_name: z.string().optional(),
})

app.put('/accounts/profile/', requireAuth, zValidator('json', profileUpdateSchema), async (c) => {
  const body = c.req.valid('json')
  const user = c.get('user')!

  const [updated] = await db.update(users).set({
    ...(body.username !== undefined && { username: body.username }),
    ...(body.email !== undefined && { email: body.email }),
    ...(body.first_name !== undefined && { firstName: body.first_name }),
    ...(body.last_name !== undefined && { lastName: body.last_name }),
    ...(body.is_vendor !== undefined && { isVendor: body.is_vendor }),
    ...(body.phone !== undefined && { phone: body.phone }),
    ...(body.company_name !== undefined && { companyName: body.company_name }),
  }).where(eq(users.id, user.id)).returning()

  return c.json(serializeUser(updated))
})

export default app
