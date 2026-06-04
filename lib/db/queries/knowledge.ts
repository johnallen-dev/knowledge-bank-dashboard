import { getDb } from '../client'

export interface KnowledgeEntry {
  id: number
  uuid: string
  question: string
  answer: string
  category_id: number | null
  tags: string
  source_type: string
  source_url: string | null
  notion_page_id: string | null
  related_ids: string
  is_archived: number
  confidence: number
  view_count: number
  helpful_count: number
  created_at: string
  updated_at: string
  category_name?: string
  rank?: number
}

export interface KnowledgeEntryInput {
  question: string
  answer: string
  category_id?: number | null
  tags?: string[]
  source_type?: string
  source_url?: string | null
  notion_page_id?: string
  related_ids?: number[]
}

function toEntry(row: Record<string, unknown>): KnowledgeEntry {
  return {
    id: Number(row.id),
    uuid: String(row.uuid ?? ''),
    question: String(row.question ?? ''),
    answer: String(row.answer ?? ''),
    category_id: row.category_id != null ? Number(row.category_id) : null,
    tags: String(row.tags ?? '[]'),
    source_type: String(row.source_type ?? 'manual'),
    source_url: row.source_url != null ? String(row.source_url) : null,
    notion_page_id: row.notion_page_id != null ? String(row.notion_page_id) : null,
    related_ids: String(row.related_ids ?? '[]'),
    is_archived: Number(row.is_archived ?? 0),
    confidence: Number(row.confidence ?? 1),
    view_count: Number(row.view_count ?? 0),
    helpful_count: Number(row.helpful_count ?? 0),
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
    category_name: row.category_name != null ? String(row.category_name) : undefined,
    rank: row.rank != null ? Number(row.rank) : undefined,
  }
}

export async function listKnowledge(opts: {
  q?: string
  category?: string
  archived?: boolean
  page?: number
  limit?: number
}): Promise<{ entries: KnowledgeEntry[]; total: number }> {
  const db = await getDb()
  const { q, category, archived = false, page = 1, limit = 20 } = opts
  const offset = (page - 1) * limit

  if (q && q.trim()) {
    try {
      const safeQ = buildFtsQuery(q)
      if (!safeQ) throw new Error('empty query')
      const { rows } = await db.execute({
        sql: `SELECT ke.*, c.name as category_name, fts.rank
              FROM knowledge_fts fts
              JOIN knowledge_entries ke ON ke.id = fts.rowid
              LEFT JOIN categories c ON c.id = ke.category_id
              WHERE knowledge_fts MATCH ? AND ke.is_archived = ?
              ORDER BY fts.rank LIMIT ? OFFSET ?`,
        args: [safeQ, archived ? 1 : 0, limit, offset],
      })
      const { rows: cr } = await db.execute({
        sql: `SELECT COUNT(*) as total FROM knowledge_fts fts JOIN knowledge_entries ke ON ke.id = fts.rowid WHERE knowledge_fts MATCH ? AND ke.is_archived = ?`,
        args: [safeQ, archived ? 1 : 0],
      })
      return { entries: rows.map(r => toEntry(r as Record<string, unknown>)), total: Number(cr[0].total) }
    } catch {
      // fall through to regular search
    }
  }

  let where = 'WHERE ke.is_archived = ?'
  const params: (string | number)[] = [archived ? 1 : 0]
  if (category) { where += ' AND c.slug = ?'; params.push(category) }

  const { rows } = await db.execute({
    sql: `SELECT ke.*, c.name as category_name FROM knowledge_entries ke LEFT JOIN categories c ON c.id = ke.category_id ${where} ORDER BY ke.updated_at DESC LIMIT ? OFFSET ?`,
    args: [...params, limit, offset],
  })
  const { rows: cr } = await db.execute({
    sql: `SELECT COUNT(*) as total FROM knowledge_entries ke LEFT JOIN categories c ON c.id = ke.category_id ${where}`,
    args: params,
  })

  return { entries: rows.map(r => toEntry(r as Record<string, unknown>)), total: Number(cr[0].total) }
}

export async function getKnowledgeById(id: number): Promise<KnowledgeEntry | null> {
  const db = await getDb()
  await db.execute({ sql: 'UPDATE knowledge_entries SET view_count = view_count + 1 WHERE id = ?', args: [id] })
  const { rows } = await db.execute({
    sql: `SELECT ke.*, c.name as category_name FROM knowledge_entries ke LEFT JOIN categories c ON c.id = ke.category_id WHERE ke.id = ?`,
    args: [id],
  })
  return rows[0] ? toEntry(rows[0] as Record<string, unknown>) : null
}

export async function exactMatch(question: string): Promise<KnowledgeEntry | null> {
  const db = await getDb()
  const { rows } = await db.execute({
    sql: `SELECT ke.*, c.name as category_name FROM knowledge_entries ke LEFT JOIN categories c ON c.id = ke.category_id WHERE lower(ke.question) = lower(?) AND ke.is_archived = 0 LIMIT 1`,
    args: [question],
  })
  return rows[0] ? toEntry(rows[0] as Record<string, unknown>) : null
}

function buildFtsQuery(query: string): string {
  const clean = query
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!clean) return ''
  return clean
    .split(' ')
    .filter(w => w.length > 1)
    .map(w => `${w}*`)
    .join(' ')
}

export async function ftsSearch(query: string, limit = 5): Promise<KnowledgeEntry[]> {
  const db = await getDb()
  const safeQ = buildFtsQuery(query)
  if (!safeQ) return []
  try {
    const { rows } = await db.execute({
      sql: `SELECT ke.*, fts.rank, c.name as category_name FROM knowledge_fts fts JOIN knowledge_entries ke ON ke.id = fts.rowid LEFT JOIN categories c ON c.id = ke.category_id WHERE knowledge_fts MATCH ? AND ke.is_archived = 0 ORDER BY fts.rank LIMIT ?`,
      args: [safeQ, limit],
    })
    return rows.map(r => toEntry(r as Record<string, unknown>))
  } catch {
    return []
  }
}

export async function createKnowledge(input: KnowledgeEntryInput): Promise<number> {
  const db = await getDb()
  const result = await db.execute({
    sql: `INSERT INTO knowledge_entries (question, answer, category_id, tags, source_type, source_url, notion_page_id, related_ids) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      input.question,
      input.answer,
      input.category_id ?? null,
      JSON.stringify(input.tags ?? []),
      input.source_type ?? 'manual',
      input.source_url ?? null,
      input.notion_page_id ?? null,
      JSON.stringify(input.related_ids ?? []),
    ],
  })
  return Number(result.lastInsertRowid)
}

/**
 * Upsert a knowledge entry by question text (case-insensitive).
 * Returns { id, action } where action is 'created' or 'updated'.
 * Existing entries are updated in-place; their revision history is preserved.
 */
export async function upsertKnowledge(
  input: KnowledgeEntryInput
): Promise<{ id: number; action: 'created' | 'updated' }> {
  const db = await getDb()

  const { rows } = await db.execute({
    sql: `SELECT id FROM knowledge_entries WHERE lower(question) = lower(?) AND is_archived = 0 LIMIT 1`,
    args: [input.question],
  })

  if (rows[0]) {
    const id = Number(rows[0].id)
    await updateKnowledge(id, input, 'Updated via import')
    return { id, action: 'updated' }
  }

  const id = await createKnowledge(input)
  return { id, action: 'created' }
}

export async function updateKnowledge(id: number, input: Partial<KnowledgeEntryInput>, changeNote?: string): Promise<void> {
  const db = await getDb()
  const { rows } = await db.execute({ sql: 'SELECT * FROM knowledge_entries WHERE id = ?', args: [id] })
  const existing = rows[0] as Record<string, unknown>
  if (!existing) throw new Error('Entry not found')

  await db.execute({
    sql: `INSERT INTO knowledge_revisions (entry_id, question, answer, change_note) VALUES (?, ?, ?, ?)`,
    args: [id, String(existing.question), String(existing.answer), changeNote ?? null],
  })

  const fields: string[] = []
  const values: (string | number | null)[] = []

  if (input.question !== undefined) { fields.push('question = ?'); values.push(input.question) }
  if (input.answer !== undefined) { fields.push('answer = ?'); values.push(input.answer) }
  if (input.category_id !== undefined) { fields.push('category_id = ?'); values.push(input.category_id ?? null) }
  if (input.tags !== undefined) { fields.push('tags = ?'); values.push(JSON.stringify(input.tags)) }
  if (input.source_type !== undefined) { fields.push('source_type = ?'); values.push(input.source_type) }
  if (input.source_url !== undefined) { fields.push('source_url = ?'); values.push(input.source_url ?? null) }
  if (input.related_ids !== undefined) { fields.push('related_ids = ?'); values.push(JSON.stringify(input.related_ids)) }

  if (fields.length === 0) return
  fields.push("updated_at = datetime('now')")
  await db.execute({ sql: `UPDATE knowledge_entries SET ${fields.join(', ')} WHERE id = ?`, args: [...values, id] })
}

export async function getKnowledgeSource(id: number): Promise<{ id: number; source_type: string } | null> {
  const db = await getDb()
  const { rows } = await db.execute({
    sql: 'SELECT id, source_type FROM knowledge_entries WHERE id = ? AND is_archived = 0',
    args: [id],
  })
  return rows[0]
    ? { id: Number(rows[0].id), source_type: String(rows[0].source_type ?? 'manual') }
    : null
}

export async function archiveKnowledge(id: number): Promise<void> {
  const db = await getDb()
  await db.execute({ sql: "UPDATE knowledge_entries SET is_archived = 1, updated_at = datetime('now') WHERE id = ?", args: [id] })
}

export async function getRevisions(entryId: number) {
  const db = await getDb()
  const { rows } = await db.execute({
    sql: 'SELECT * FROM knowledge_revisions WHERE entry_id = ? ORDER BY created_at DESC',
    args: [entryId],
  })
  return rows.map(r => {
    const row = r as Record<string, unknown>
    return {
      id: Number(row.id),
      question: String(row.question ?? ''),
      answer: String(row.answer ?? ''),
      changed_by: String(row.changed_by ?? 'staff'),
      change_note: row.change_note != null ? String(row.change_note) : null,
      created_at: String(row.created_at ?? ''),
    }
  })
}
