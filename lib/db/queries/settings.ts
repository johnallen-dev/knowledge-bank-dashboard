import { getDb } from '../client'

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb()
  const { rows } = await db.execute({ sql: 'SELECT value FROM settings WHERE key = ?', args: [key] })
  return rows[0] ? String(rows[0].value) : null
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb()
  await db.execute({
    sql: `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
    args: [key, value],
  })
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const db = await getDb()
  const { rows } = await db.execute('SELECT key, value FROM settings')
  return Object.fromEntries(rows.map(r => [String(r.key), String(r.value)]))
}
