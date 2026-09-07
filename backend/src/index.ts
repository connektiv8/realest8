import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import { db } from './db/client.js'
import authRouter from './routes/auth.js'
import propertiesRouter from './routes/properties.js'
import imagesRouter from './routes/images.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const migrationsFolder = join(__dirname, '..', 'drizzle')

console.log('[db] running migrations…')
await migrate(db, { migrationsFolder })
console.log('[db] migrations up to date')

const app = new Hono()

app.use('*', logger())
app.use('*', cors({
  origin: (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:5111,http://localhost:5173').split(','),
  allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 600,
}))

app.get('/api/health', (c) => c.json({ status: 'ok', ts: new Date().toISOString() }))

app.route('/api', authRouter)
app.route('/api/listings', propertiesRouter)
app.route('/api/listings', imagesRouter)

app.onError((error, c) => {
  console.error('[api] unhandled error', error)
  return c.json({ detail: error instanceof Error ? error.message : 'Internal Server Error' }, 500)
})

app.notFound((c) => c.json({ detail: 'Not found.' }, 404))

const port = Number(process.env.PORT ?? 8889)

serve({ fetch: app.fetch, port }, () => {
  console.log(`[api] listening on http://localhost:${port}`)
})
