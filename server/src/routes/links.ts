import type { FastifyInstance } from "fastify"
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { db } from "../db/index.js"
import { links } from "../db/schema.js"
import { eq, desc, sql } from "drizzle-orm"
import { s3 } from "../lib/cloudflare.js"

const SLUG_REGEX = /^[a-zA-Z0-9_-]+$/

export async function linksRoutes(app: FastifyInstance) {
  app.get("/links/export", async (_request, reply) => {
    const allLinks = await db
      .select()
      .from(links)
      .orderBy(desc(links.createdAt))

    const header = "id,original_url,shortened_url,access_count,created_at"
    const rows = allLinks.map((link) =>
      [
        link.id,
        `"${link.originalUrl.replace(/"/g, '""')}"`,
        link.shortenedUrl,
        link.accessCount,
        link.createdAt.toISOString(),
      ].join(","),
    )
    const csv = [header, ...rows].join("\n")

    const key = `exports/links-${crypto.randomUUID()}.csv`

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET,
        Key: key,
        Body: csv,
        ContentType: "text/csv",
      }),
    )

    const downloadUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET,
        Key: key,
      }),
      { expiresIn: 300 },
    )

    return reply.status(200).send({ downloadUrl })
  })

  app.get("/links", async (_request, reply) => {
    const allLinks = await db
      .select()
      .from(links)
      .orderBy(desc(links.createdAt))

    return reply.status(200).send(allLinks)
  })

  app.get("/links/:shortenedUrl", async (request, reply) => {
    const { shortenedUrl } = request.params as { shortenedUrl: string }

    const [link] = await db
      .update(links)
      .set({ accessCount: sql`${links.accessCount} + 1` })
      .where(eq(links.shortenedUrl, shortenedUrl))
      .returning()

    if (!link) {
      return reply.status(404).send({ message: "Link not found." })
    }

    return reply.redirect(link.originalUrl, 302)
  })

  app.delete("/links/:id", async (request, reply) => {
    const { id } = request.params as { id: string }

    const [deleted] = await db.delete(links).where(eq(links.id, id)).returning()

    if (!deleted) {
      return reply.status(404).send({ message: "Link not found." })
    }

    return reply.status(204).send()
  })

  app.post("/links", async (request, reply) => {
    const { original_url, shortened_url } = request.body as {
      original_url: unknown
      shortened_url: unknown
    }

    if (typeof original_url !== "string" || !URL.canParse(original_url)) {
      return reply.status(400).send({ message: "Invalid original_url." })
    }

    const parsed = new URL(original_url)
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return reply
        .status(400)
        .send({ message: "original_url must use http or https." })
    }

    if (typeof shortened_url !== "string" || !SLUG_REGEX.test(shortened_url)) {
      return reply.status(400).send({
        message:
          "Invalid shortened_url. Use only letters, numbers, hyphens, or underscores.",
      })
    }

    if (shortened_url.length < 3 || shortened_url.length > 50) {
      return reply
        .status(400)
        .send({ message: "shortened_url must be between 3 and 50 characters." })
    }

    try {
      const [created] = await db
        .insert(links)
        .values({ originalUrl: original_url, shortenedUrl: shortened_url })
        .returning()

      return reply.status(201).send(created)
    } catch (e: any) {
      if (e.code === "23505") {
        return reply
          .status(409)
          .send({ message: "shortened_url already in use." })
      }
      throw e
    }
  })
}
