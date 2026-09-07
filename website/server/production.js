/**
 * Production server for the Realest8 public website. Purely static — no API
 * proxy, unlike the portal frontend.
 */

import express from 'express'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')
const PORT = Number(process.env.PORT ?? 3000)

const app = express()

app.use(express.static(distDir))
app.get('/{*path}', (_req, res) => res.sendFile(path.join(distDir, 'index.html')))

app.listen(PORT, () => {
  console.log(`[website] listening on http://localhost:${PORT}`)
})
