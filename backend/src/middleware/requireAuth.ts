import { createMiddleware } from 'hono/factory'
import { getCookie } from 'hono/cookie'
import { getUserForSession, type AuthedUser } from '../lib/session.js'

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthedUser | null
  }
}

// Populates c.get('user') when a valid session cookie is present, but never
// blocks the request — mirrors DRF's IsAuthenticatedOrReadOnly default,
// where routes decide for themselves whether auth is required.
export const attachUser = createMiddleware(async (c, next) => {
  const sessionId = getCookie(c, 'session')
  c.set('user', sessionId ? await getUserForSession(sessionId) : null)
  await next()
})

export const requireAuth = createMiddleware(async (c, next) => {
  if (!c.get('user')) return c.json({ detail: 'Authentication credentials were not provided.' }, 401)
  await next()
})
