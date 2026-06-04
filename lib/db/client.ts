import { createClient, type Client } from '@libsql/client'
import path from 'path'

let client: Client | null = null
let initPromise: Promise<void> | null = null

function getRawClient(): Client {
  if (!client) {
    if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
      // Production: Turso cloud database
      client = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      })
    } else {
      // Development: local SQLite file
      const dbPath = process.env.DB_PATH ?? path.join(process.cwd(), 'data', 'knowledge-bank.db')
      client = createClient({ url: `file:${dbPath}` })
    }
  }
  return client
}

export async function getDb(): Promise<Client> {
  const c = getRawClient()
  if (!initPromise) {
    const { runMigrations } = await import('./schema')
    initPromise = runMigrations(c)
  }
  await initPromise
  return c
}
