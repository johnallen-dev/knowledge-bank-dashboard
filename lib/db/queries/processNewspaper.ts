import { getDb } from '../client'
import { getProcessStatus } from '@/lib/processNewspaper/status'
import type { NewspaperProcess, NewspaperProcessWithStatus, ProcessInput, NewspaperEdition } from '@/lib/processNewspaper/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function toProcess(row: Record<string, unknown>): NewspaperProcess {
  return {
    id: Number(row.id),
    uuid: String(row.uuid ?? ''),
    category: String(row.category ?? '') as NewspaperProcess['category'],
    title: String(row.title ?? ''),
    content_html: String(row.content_html ?? ''),
    duration_type: String(row.duration_type ?? '') as NewspaperProcess['duration_type'],
    duration_start: row.duration_start == null ? null : String(row.duration_start),
    duration_end: row.duration_end == null ? null : String(row.duration_end),
    duration_note: row.duration_note == null ? null : String(row.duration_note),
    special_note: row.special_note == null ? null : String(row.special_note),
    is_disabled: Number(row.is_disabled ?? 0) === 1,
    featured_in_cycle: Number(row.featured_in_cycle ?? 0) === 1,
    last_headline_at: row.last_headline_at == null ? null : String(row.last_headline_at),
    last_supporting_at: row.last_supporting_at == null ? null : String(row.last_supporting_at),
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  }
}

function toEdition(row: Record<string, unknown>): NewspaperEdition {
  let supportingIds: number[] = []
  try { supportingIds = JSON.parse(String(row.supporting_process_ids ?? '[]')) } catch { /* */ }
  return {
    edition_date: String(row.edition_date ?? ''),
    headline_process_id: row.headline_process_id == null ? null : Number(row.headline_process_id),
    supporting_process_ids: supportingIds,
    trivia_text: row.trivia_text == null ? null : String(row.trivia_text),
    created_at: String(row.created_at ?? ''),
  }
}

// ── newspaper_processes CRUD ──────────────────────────────────────────────────

export async function createProcess(input: ProcessInput): Promise<number> {
  const db = await getDb()
  const result = await db.execute({
    sql: `INSERT INTO newspaper_processes
          (category, title, content_html, duration_type, duration_start, duration_end, duration_note, special_note, is_disabled)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      input.category, input.title, input.content_html, input.duration_type,
      input.duration_start ?? null, input.duration_end ?? null, input.duration_note ?? null,
      input.special_note ?? null, input.is_disabled ? 1 : 0,
    ],
  })
  return Number(result.lastInsertRowid)
}

export async function updateProcess(id: number, input: ProcessInput): Promise<void> {
  const db = await getDb()
  await db.execute({
    sql: `UPDATE newspaper_processes SET
            category = ?, title = ?, content_html = ?, duration_type = ?,
            duration_start = ?, duration_end = ?, duration_note = ?, special_note = ?,
            is_disabled = ?, updated_at = datetime('now')
          WHERE id = ?`,
    args: [
      input.category, input.title, input.content_html, input.duration_type,
      input.duration_start ?? null, input.duration_end ?? null, input.duration_note ?? null,
      input.special_note ?? null, input.is_disabled ? 1 : 0, id,
    ],
  })
}

export async function deleteProcess(id: number): Promise<void> {
  const db = await getDb()
  await db.execute({ sql: 'DELETE FROM newspaper_processes WHERE id = ?', args: [id] })
}

export async function getProcess(id: number): Promise<NewspaperProcess | null> {
  const db = await getDb()
  const { rows } = await db.execute({ sql: 'SELECT * FROM newspaper_processes WHERE id = ?', args: [id] })
  return rows[0] ? toProcess(rows[0] as Record<string, unknown>) : null
}

export async function getProcessesByIds(ids: number[]): Promise<NewspaperProcess[]> {
  if (ids.length === 0) return []
  const db = await getDb()
  const { rows } = await db.execute({
    sql: `SELECT * FROM newspaper_processes WHERE id IN (${ids.map(() => '?').join(',')})`,
    args: ids,
  })
  const byId = new Map(rows.map(r => [Number((r as Record<string, unknown>).id), toProcess(r as Record<string, unknown>)]))
  return ids.map(id => byId.get(id)).filter((p): p is NewspaperProcess => !!p)
}

export async function listProcesses(filter: {
  q?: string
  category?: string
  page?: number
  limit?: number
}): Promise<{ entries: NewspaperProcessWithStatus[]; total: number }> {
  const db = await getDb()
  const clauses: string[] = []
  const args: string[] = []
  if (filter.q?.trim()) {
    clauses.push('(title LIKE ? OR content_html LIKE ?)')
    args.push(`%${filter.q.trim()}%`, `%${filter.q.trim()}%`)
  }
  if (filter.category) {
    clauses.push('category = ?')
    args.push(filter.category)
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''

  const { rows: countRows } = await db.execute({ sql: `SELECT COUNT(*) as c FROM newspaper_processes ${where}`, args })
  const total = Number((countRows[0] as Record<string, unknown>).c)

  const page = filter.page ?? 1
  const limit = filter.limit ?? 20
  const offset = (page - 1) * limit
  const { rows } = await db.execute({
    sql: `SELECT * FROM newspaper_processes ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    args: [...args, String(limit), String(offset)],
  })

  const { getTodayInNewspaperTimezone } = await import('@/lib/processNewspaper/timezone')
  const todayStr = getTodayInNewspaperTimezone()
  const entries = rows.map(r => {
    const process = toProcess(r as Record<string, unknown>)
    return { ...process, status: getProcessStatus(process, todayStr) }
  })

  return { entries, total }
}

export async function listEligibleProcesses(todayStr: string): Promise<NewspaperProcess[]> {
  const db = await getDb()
  const { rows } = await db.execute('SELECT * FROM newspaper_processes WHERE is_disabled = 0')
  return rows
    .map(r => toProcess(r as Record<string, unknown>))
    .filter(p => getProcessStatus(p, todayStr) === 'active')
}

// ── Rotation bookkeeping ──────────────────────────────────────────────────────

export async function resetFeaturedInCycle(ids: number[]): Promise<void> {
  if (ids.length === 0) return
  const db = await getDb()
  await db.execute({
    sql: `UPDATE newspaper_processes SET featured_in_cycle = 0 WHERE id IN (${ids.map(() => '?').join(',')})`,
    args: ids,
  })
}

export async function markHeadlineFeatured(id: number, todayStr: string): Promise<void> {
  const db = await getDb()
  await db.execute({
    sql: `UPDATE newspaper_processes SET featured_in_cycle = 1, last_headline_at = ? WHERE id = ?`,
    args: [todayStr, id],
  })
}

export async function markSupportingShown(ids: number[], todayStr: string): Promise<void> {
  if (ids.length === 0) return
  const db = await getDb()
  await db.execute({
    sql: `UPDATE newspaper_processes SET last_supporting_at = ? WHERE id IN (${ids.map(() => '?').join(',')})`,
    args: [todayStr, ...ids],
  })
}

// ── newspaper_editions ─────────────────────────────────────────────────────────

export async function getEdition(dateStr: string): Promise<NewspaperEdition | null> {
  const db = await getDb()
  const { rows } = await db.execute({ sql: 'SELECT * FROM newspaper_editions WHERE edition_date = ?', args: [dateStr] })
  return rows[0] ? toEdition(rows[0] as Record<string, unknown>) : null
}

export async function deleteEdition(dateStr: string): Promise<void> {
  const db = await getDb()
  await db.execute({ sql: 'DELETE FROM newspaper_editions WHERE edition_date = ?', args: [dateStr] })
}

export async function createEdition(input: {
  edition_date: string
  headline_process_id: number
  supporting_process_ids: number[]
  trivia_text: string | null
}): Promise<void> {
  const db = await getDb()
  await db.execute({
    sql: `INSERT INTO newspaper_editions (edition_date, headline_process_id, supporting_process_ids, trivia_text)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(edition_date) DO NOTHING`,
    args: [input.edition_date, input.headline_process_id, JSON.stringify(input.supporting_process_ids), input.trivia_text],
  })
}
