import { getDb } from '../client'

export interface Category {
  id: number
  name: string
  slug: string
  color: string
  icon: string | null
  created_at: string
  entry_count?: number
}

export async function listCategories(): Promise<Category[]> {
  const db = await getDb()
  const { rows } = await db.execute(`
    SELECT c.*, COUNT(ke.id) as entry_count
    FROM categories c
    LEFT JOIN knowledge_entries ke ON ke.category_id = c.id AND ke.is_archived = 0
    GROUP BY c.id
    ORDER BY c.name
  `)
  return rows.map(r => {
    const row = r as Record<string, unknown>
    return {
      id: Number(row.id),
      name: String(row.name ?? ''),
      slug: String(row.slug ?? ''),
      color: String(row.color ?? '#6366f1'),
      icon: row.icon != null ? String(row.icon) : null,
      created_at: String(row.created_at ?? ''),
      entry_count: Number(row.entry_count ?? 0),
    }
  })
}

export async function createCategory(input: { name: string; color?: string; icon?: string }): Promise<number> {
  const db = await getDb()
  const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const result = await db.execute({
    sql: 'INSERT INTO categories (name, slug, color, icon) VALUES (?, ?, ?, ?)',
    args: [input.name, slug, input.color ?? '#6366f1', input.icon ?? null],
  })
  return Number(result.lastInsertRowid)
}
