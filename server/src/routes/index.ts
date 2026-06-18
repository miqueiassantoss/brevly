import type { FastifyInstance } from 'fastify'
import { linksRoutes } from './links.js'

export async function routes(app: FastifyInstance) {
  await app.register(linksRoutes)
}
