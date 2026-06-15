import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const links = pgTable('links', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  originalUrl: text('original_url').notNull(),
  shortenedUrl: text('shortened_url').notNull().unique(),
  accessCount: integer('access_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
