import type { FastifyInstance } from 'fastify'
import { db } from '../db/index.js'
import { links } from '../db/schema.js'
import { eq, desc, sql } from 'drizzle-orm'

const SLUG_REGEX = /^[a-zA-Z0-9_-]+$/

export async function linksRoutes(app: FastifyInstance) {
  app.get('/links', async (_request, reply) => {
    const allLinks = await db
      .select()
      .from(links)
      .orderBy(desc(links.createdAt))

    return reply.status(200).send(allLinks)
  })

  app.get('/links/:shortenedUrl', async (request, reply) => {
    const { shortenedUrl } = request.params as { shortenedUrl: string }

    const [link] = await db
      .select()
      .from(links)
      .where(eq(links.shortenedUrl, shortenedUrl))
      .limit(1)

    if (!link) {
      return reply.status(404).send({ message: 'Link not found.' })
    }

    const [updated] = await db
      .update(links)
      .set({ accessCount: sql`${links.accessCount} + 1` })
      .where(eq(links.id, link.id))
      .returning()

    return reply.status(200).send(updated)
  })

  app.delete('/links/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const [deleted] = await db
      .delete(links)
      .where(eq(links.id, id))
      .returning()

    if (!deleted) {
      return reply.status(404).send({ message: 'Link not found.' })
    }

    return reply.status(204).send()
  })

  app.post('/links', async (request, reply) => {
    const { original_url, shortened_url } = request.body as {
      original_url: unknown
      shortened_url: unknown
    }

    if (typeof original_url !== 'string' || !URL.canParse(original_url)) {
      return reply.status(400).send({ message: 'Invalid original_url.' })
    }

    if (typeof shortened_url !== 'string' || !SLUG_REGEX.test(shortened_url)) {
      return reply.status(400).send({ message: 'Invalid shortened_url. Use only letters, numbers, hyphens, or underscores.' })
    }

    const existing = await db
      .select()
      .from(links)
      .where(eq(links.shortenedUrl, shortened_url))
      .limit(1)

    if (existing.length > 0) {
      return reply.status(409).send({ message: 'shortened_url already in use.' })
    }

    const [created] = await db
      .insert(links)
      .values({ originalUrl: original_url, shortenedUrl: shortened_url })
      .returning()

    return reply.status(201).send(created)
  })
}
