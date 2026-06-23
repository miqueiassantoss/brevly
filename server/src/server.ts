import 'dotenv/config'
import fastify from 'fastify'
import cors from '@fastify/cors'
import { routes } from './routes/index.js'

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_ACCESS_KEY_ID',
  'CLOUDFLARE_SECRET_ACCESS_KEY',
  'CLOUDFLARE_BUCKET',
]

for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

const app = fastify()

await app.register(cors, {
  origin: process.env.FRONTEND_URL ?? true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
})
await app.register(routes)

app.get('/health', async () => {
  return { status: 'ok' }
})

const port = Number(process.env.PORT) || 3333

await app.listen({ port, host: '0.0.0.0' })
console.log(`Server running on port ${port}`)
