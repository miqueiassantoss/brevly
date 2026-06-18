import 'dotenv/config'
import fastify from 'fastify'
import cors from '@fastify/cors'
import { routes } from './routes/index.js'

const app = fastify()

await app.register(cors)
await app.register(routes)

app.get('/health', async () => {
  return { status: 'ok' }
})

const port = Number(process.env.PORT) || 3333

await app.listen({ port, host: '0.0.0.0' })
console.log(`Server running on port ${port}`)
