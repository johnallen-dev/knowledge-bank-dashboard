import { createClient, type Client } from '@libsql/client'
import path from 'path'

let client: Client | null = null
let initPromise: Promise<void> | null = null

// Next.js patches global fetch to apply its own Data Cache to any fetch call made during
// request handling, including ones made deep inside third-party libraries. @libsql/client's
// HTTP transport queues and flushes its requests via a microtask queue, which detaches the
// actual fetch call from the request's AsyncLocalStorage context — so it falls back to
// Next's cache-by-default behavior and can silently serve stale query results for the exact
// same SQL text/args, no matter how much time has passed or how many times it's re-queried.
// Forcing `cache: 'no-store'` on every request this client issues bypasses that entirely.
function noStoreFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (input instanceof Request) {
    return fetch(new Request(input, { cache: 'no-store' }))
  }
  return fetch(input, { ...init, cache: 'no-store' })
}

function getRawClient(): Client {
  if (!client) {
    if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
      // Production: Turso cloud database
      client = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
        fetch: noStoreFetch,
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
