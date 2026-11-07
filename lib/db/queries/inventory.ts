import { getDb } from '../client'
import { formatSheetNo } from '@/lib/inventory/sheetNumber'
import type {
  InventorySheet, InventorySheetItem, InventorySheetEvent, InventorySheetRevision,
  SheetInput, SheetFilters, SheetStatus, SheetEventType,
} from '@/lib/inventory/types'

/** Appends `column IN (?, ?, …)` (or `column = ?` for a single value) to clauses/args
 * in place, for filter fields that accept either a scalar or an array. */
function addInClause(
  clauses: string[],
  args: (string | number)[],
  column: string,
  value: string | string[] | undefined,
): void {
  if (value == null || (Array.isArray(value) && value.length === 0)) return
  const values = Array.isArray(value) ? value : [value]
  clauses.push(`${column} IN (${values.map(() => '?').join(',')})`)
  args.push(...values)
}

// ── Row mappers ──────────────────────────────────────────────────────────────────

function toSheet(row: Record<string, unknown>): InventorySheet {
  return {
    id: Number(row.id),
    sheet_no: String(row.sheet_no ?? ''),
    status: String(row.status ?? 'draft') as SheetStatus,
    personnel_name: String(row.personnel_name ?? ''),
    inventory_date: (row.inventory_date == null ? '' : String(row.inventory_date)) as InventorySheet['inventory_date'],
    building: String(row.building ?? ''),
    building_is_custom: Number(row.building_is_custom ?? 0) === 1,
    location_category: (row.location_category == null ? '' : String(row.location_category)) as InventorySheet['location_category'],
    location_option: String(row.location_option ?? ''),
    location_label: String(row.location_label ?? ''),
    linen_owner: (row.linen_owner == null ? '' : String(row.linen_owner)) as InventorySheet['linen_owner'],
    linen_owner_customer_name: row.linen_owner_customer_name == null ? null : String(row.linen_owner_customer_name),
    time_of_count: row.time_of_count == null ? null : String(row.time_of_count),
    original_sheet_id: row.original_sheet_id == null ? null : Number(row.original_sheet_id),
    needs_review: Number(row.needs_review ?? 0) === 1,
    needs_review_note: row.needs_review_note == null ? null : String(row.needs_review_note),
    created_by: String(row.created_by ?? ''),
    created_at: String(row.created_at ?? ''),
    submitted_by: row.submitted_by == null ? null : String(row.submitted_by),
    submitted_at: row.submitted_at == null ? null : String(row.submitted_at),
    last_edited_by: row.last_edited_by == null ? null : String(row.last_edited_by),
    last_edited_at: row.last_edited_at == null ? null : String(row.last_edited_at),
    updated_at: String(row.updated_at ?? ''),
  }
}

function toSheetItem(row: Record<string, unknown>): InventorySheetItem {
  return {
    id: Number(row.id),
    sheet_id: Number(row.sheet_id),
    category: String(row.category ?? 'other') as InventorySheetItem['category'],
    item_key: String(row.item_key ?? ''),
    item_label: String(row.item_label ?? ''),
    is_custom_item: Number(row.is_custom_item ?? 0) === 1,
    quantity: row.quantity == null ? null : Number(row.quantity),
    sort_order: Number(row.sort_order ?? 0),
  }
}

function toSheetEvent(row: Record<string, unknown>): InventorySheetEvent {
  let detail: Record<string, unknown> | null = null
  if (row.detail_json != null) {
    try { detail = JSON.parse(String(row.detail_json)) } catch { /* ignore malformed */ }
  }
  return {
    id: Number(row.id),
    sheet_id: Number(row.sheet_id),
    event_type: String(row.event_type ?? '') as SheetEventType,
    actor: row.actor == null ? null : String(row.actor),
    related_sheet_id: row.related_sheet_id == null ? null : Number(row.related_sheet_id),
    revision_id: row.revision_id == null ? null : Number(row.revision_id),
    detail,
    event_at: String(row.event_at ?? ''),
  }
}

function toSheetRevision(row: Record<string, unknown>): InventorySheetRevision {
  return {
    id: Number(row.id),
    sheet_id: Number(row.sheet_id),
    snapshot: JSON.parse(String(row.snapshot_json ?? '{}')),
    change_note: row.change_note == null ? null : String(row.change_note),
    edited_by: String(row.edited_by ?? ''),
    edited_at: String(row.edited_at ?? ''),
  }
}

// ── Sheet CRUD ───────────────────────────────────────────────────────────────────

/** Two-step insert (placeholder sheet_no, then backfill from the real id) run as one
 * atomic batch, so sheet_no uniqueness falls directly out of SQLite's atomic
 * AUTOINCREMENT id assignment — no application-level locking needed. */
export async function createDraftSheet(input: Partial<SheetInput>, createdBy: string): Promise<InventorySheet> {
  const db = await getDb()
  const placeholder = `TMP-${Math.random().toString(16).slice(2, 10)}`

  const insertResult = await db.execute({
    sql: `INSERT INTO inventory_sheets
          (sheet_no, status, personnel_name, inventory_date, building, building_is_custom,
           location_category, location_option, location_label, linen_owner, linen_owner_customer_name,
           time_of_count, original_sheet_id, created_by)
          VALUES (?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      placeholder,
      input.personnel_name ?? '', input.inventory_date ?? '', input.building ?? '',
      input.building_is_custom ? 1 : 0, input.location_category ?? '', input.location_option ?? '',
      input.location_label ?? '', input.linen_owner ?? '', input.linen_owner_customer_name ?? null,
      input.time_of_count ?? null, input.original_sheet_id ?? null, createdBy,
    ],
  })
  const id = Number(insertResult.lastInsertRowid)
  const sheetNo = formatSheetNo(id)
  await db.execute({ sql: `UPDATE inventory_sheets SET sheet_no = ? WHERE id = ?`, args: [sheetNo, id] })

  if (input.items && input.items.length > 0) {
    await replaceSheetItems(id, input.items)
  }

  const sheet = await getSheetById(id)
  if (!sheet) throw new Error('Failed to create draft sheet')
  return sheet
}

export async function getSheetById(id: number): Promise<InventorySheet | null> {
  const db = await getDb()
  const { rows } = await db.execute({ sql: 'SELECT * FROM inventory_sheets WHERE id = ?', args: [id] })
  return rows[0] ? toSheet(rows[0] as Record<string, unknown>) : null
}

export async function getSheetByNo(sheetNo: string): Promise<InventorySheet | null> {
  const db = await getDb()
  const { rows } = await db.execute({ sql: 'SELECT * FROM inventory_sheets WHERE sheet_no = ?', args: [sheetNo] })
  return rows[0] ? toSheet(rows[0] as Record<string, unknown>) : null
}

/** Guarded to drafts only — a submitted/superseded sheet must go through the
 * password-gated edit path (applySheetEdit) instead. */
export async function updateDraftSheet(id: number, input: Partial<SheetInput>): Promise<boolean> {
  const db = await getDb()
  const result = await db.execute({
    sql: `UPDATE inventory_sheets SET
            personnel_name = ?, inventory_date = ?, building = ?, building_is_custom = ?,
            location_category = ?, location_option = ?, location_label = ?, linen_owner = ?,
            linen_owner_customer_name = ?, time_of_count = ?, original_sheet_id = ?, updated_at = datetime('now')
          WHERE id = ? AND status = 'draft'`,
    args: [
      input.personnel_name ?? '', input.inventory_date ?? '', input.building ?? '',
      input.building_is_custom ? 1 : 0, input.location_category ?? '', input.location_option ?? '',
      input.location_label ?? '', input.linen_owner ?? '', input.linen_owner_customer_name ?? null,
      input.time_of_count ?? null, input.original_sheet_id ?? null, id,
    ],
  })
  if (result.rowsAffected === 0) return false
  if (input.items) await replaceSheetItems(id, input.items)
  return true
}

export async function listSheets(filters: SheetFilters): Promise<{ sheets: InventorySheet[]; total: number }> {
  const db = await getDb()
  const clauses: string[] = []
  const args: (string | number)[] = []

  if (filters.status) {
    const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
    clauses.push(`status IN (${statuses.map(() => '?').join(',')})`)
    args.push(...statuses)
  }
  if (filters.inventory_date) { clauses.push('inventory_date = ?'); args.push(filters.inventory_date) }
  addInClause(clauses, args, 'building', filters.building)
  addInClause(clauses, args, 'location_label', filters.location_label)
  addInClause(clauses, args, 'linen_owner', filters.linen_owner)
  addInClause(clauses, args, 'personnel_name', filters.personnel)
  if (filters.needs_review) { clauses.push('needs_review = 1') }
  if (filters.search?.trim()) {
    clauses.push('(sheet_no LIKE ? OR personnel_name LIKE ? OR building LIKE ? OR location_label LIKE ?)')
    const like = `%${filters.search.trim()}%`
    args.push(like, like, like, like)
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''

  const { rows: countRows } = await db.execute({ sql: `SELECT COUNT(*) as c FROM inventory_sheets ${where}`, args })
  const total = Number((countRows[0] as Record<string, unknown>).c)

  const page = filters.page ?? 1
  const limit = filters.limit ?? 20
  const offset = (page - 1) * limit
  const { rows } = await db.execute({
    sql: `SELECT * FROM inventory_sheets ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    args: [...args, limit, offset],
  })

  return { sheets: rows.map(r => toSheet(r as Record<string, unknown>)), total }
}

/** Password-gated hard delete from the Summary records table — works on a sheet in
 * any status, not just drafts. Any other sheet whose original_sheet_id points at this
 * one is unlinked first (rather than left dangling), and the sheet's own items,
 * revisions, and events are cleaned up alongside it. */
export async function deleteSheetHard(id: number): Promise<boolean> {
  const db = await getDb()
  await db.execute({ sql: `UPDATE inventory_sheets SET original_sheet_id = NULL WHERE original_sheet_id = ?`, args: [id] })
  // Events logged on OTHER sheets (e.g. a "superseded" event on the original, logged when
  // this sheet was submitted as its recount) can still point at this id via related_sheet_id.
  // Turso enforces foreign keys, so that dangling reference must be cleared before this
  // sheet's row is deleted, or the delete fails with a foreign key constraint error.
  await db.execute({ sql: `UPDATE inventory_sheet_events SET related_sheet_id = NULL WHERE related_sheet_id = ?`, args: [id] })
  await db.execute({ sql: `DELETE FROM inventory_sheet_events WHERE sheet_id = ?`, args: [id] })
  await db.execute({ sql: `DELETE FROM inventory_sheet_revisions WHERE sheet_id = ?`, args: [id] })
  await db.execute({ sql: `DELETE FROM inventory_sheet_items WHERE sheet_id = ?`, args: [id] })
  const result = await db.execute({ sql: `DELETE FROM inventory_sheets WHERE id = ?`, args: [id] })
  return result.rowsAffected > 0
}

// ── Item CRUD ────────────────────────────────────────────────────────────────────

export async function upsertSheetItem(
  sheetId: number,
  item: { category: string; item_key: string; item_label: string; is_custom_item: boolean; quantity: number | null },
): Promise<void> {
  const db = await getDb()
  await db.execute({
    sql: `INSERT INTO inventory_sheet_items (sheet_id, category, item_key, item_label, is_custom_item, quantity)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(sheet_id, item_key) DO UPDATE SET
            item_label = excluded.item_label, quantity = excluded.quantity, updated_at = datetime('now')`,
    args: [sheetId, item.category, item.item_key, item.item_label, item.is_custom_item ? 1 : 0, item.quantity],
  })
}

/** Replaces the full item set for a sheet — used by draft autosave, submit, and edit.
 * Rows for items no longer present (a removed custom row) are deleted so stale rows
 * can't linger and skew aggregation. */
export async function replaceSheetItems(
  sheetId: number,
  items: { category: string; item_key: string; item_label: string; is_custom_item: boolean; quantity: number | null }[],
): Promise<void> {
  const db = await getDb()
  const keys = items.map(i => i.item_key)
  if (keys.length > 0) {
    await db.execute({
      sql: `DELETE FROM inventory_sheet_items WHERE sheet_id = ? AND item_key NOT IN (${keys.map(() => '?').join(',')})`,
      args: [sheetId, ...keys],
    })
  } else {
    await db.execute({ sql: `DELETE FROM inventory_sheet_items WHERE sheet_id = ?`, args: [sheetId] })
  }
  for (const item of items) {
    await upsertSheetItem(sheetId, item)
  }
}

export async function getSheetItems(sheetId: number): Promise<InventorySheetItem[]> {
  const db = await getDb()
  const { rows } = await db.execute({
    sql: 'SELECT * FROM inventory_sheet_items WHERE sheet_id = ? ORDER BY category, sort_order, id',
    args: [sheetId],
  })
  return rows.map(r => toSheetItem(r as Record<string, unknown>))
}

export async function deleteSheetItem(sheetId: number, itemKey: string): Promise<void> {
  const db = await getDb()
  await db.execute({ sql: 'DELETE FROM inventory_sheet_items WHERE sheet_id = ? AND item_key = ?', args: [sheetId, itemKey] })
}

// ── Status transitions ───────────────────────────────────────────────────────────

/** Guarded draft→submitted transition. Returns false (does nothing) if the sheet
 * isn't currently a draft — callers must check this before proceeding. */
export async function markSheetSubmitted(id: number, submittedBy: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.execute({
    sql: `UPDATE inventory_sheets SET status = 'submitted', submitted_by = ?, submitted_at = datetime('now'), updated_at = datetime('now')
          WHERE id = ? AND status = 'draft'`,
    args: [submittedBy, id],
  })
  return result.rowsAffected > 0
}

/** Guarded submitted→superseded transition — only succeeds if the sheet is still
 * the currently-valid tip (status='submitted'). Mirrors Process Newspaper's
 * revertHeadlineIfMarkedToday guard shape: ordering + a WHERE guard instead of a
 * transaction, so a losing concurrent recount can be detected and rejected cleanly. */
export async function markSheetSuperseded(id: number): Promise<boolean> {
  const db = await getDb()
  const result = await db.execute({
    sql: `UPDATE inventory_sheets SET status = 'superseded', updated_at = datetime('now') WHERE id = ? AND status = 'submitted'`,
    args: [id],
  })
  return result.rowsAffected > 0
}

export async function canCreateRecountOf(originalId: number): Promise<boolean> {
  const sheet = await getSheetById(originalId)
  return sheet?.status === 'submitted'
}

export async function setNeedsReview(id: number, flagged: boolean, note: string | null): Promise<void> {
  const db = await getDb()
  await db.execute({
    sql: `UPDATE inventory_sheets SET needs_review = ?, needs_review_note = ?, updated_at = datetime('now') WHERE id = ?`,
    args: [flagged ? 1 : 0, note, id],
  })
}

// ── Edit (password-gated) ────────────────────────────────────────────────────────

export async function snapshotSheetForRevision(id: number, editedBy: string, changeNote: string | null): Promise<number> {
  const db = await getDb()
  const sheet = await getSheetById(id)
  if (!sheet) throw new Error('Sheet not found')
  const items = await getSheetItems(id)
  const snapshot = JSON.stringify({ sheet, items })
  const result = await db.execute({
    sql: `INSERT INTO inventory_sheet_revisions (sheet_id, snapshot_json, change_note, edited_by) VALUES (?, ?, ?, ?)`,
    args: [id, snapshot, changeNote, editedBy],
  })
  return Number(result.lastInsertRowid)
}

/** Only valid for already-submitted sheets — immutable provenance fields
 * (original_sheet_id, sheet_no, created_by, created_at) are never touched here. */
export async function applySheetEdit(
  id: number,
  patch: Partial<SheetInput>,
  editedBy: string,
): Promise<boolean> {
  const db = await getDb()
  const result = await db.execute({
    sql: `UPDATE inventory_sheets SET
            personnel_name = ?, inventory_date = ?, building = ?, building_is_custom = ?,
            location_category = ?, location_option = ?, location_label = ?, linen_owner = ?,
            linen_owner_customer_name = ?, time_of_count = ?, last_edited_by = ?, last_edited_at = datetime('now'),
            updated_at = datetime('now')
          WHERE id = ? AND status IN ('submitted')`,
    args: [
      patch.personnel_name ?? '', patch.inventory_date ?? '', patch.building ?? '',
      patch.building_is_custom ? 1 : 0, patch.location_category ?? '', patch.location_option ?? '',
      patch.location_label ?? '', patch.linen_owner ?? '', patch.linen_owner_customer_name ?? null,
      patch.time_of_count ?? null, editedBy, id,
    ],
  })
  if (result.rowsAffected === 0) return false
  if (patch.items) await replaceSheetItems(id, patch.items)
  return true
}

export async function listSheetRevisions(sheetId: number): Promise<InventorySheetRevision[]> {
  const db = await getDb()
  const { rows } = await db.execute({
    sql: 'SELECT * FROM inventory_sheet_revisions WHERE sheet_id = ? ORDER BY edited_at DESC',
    args: [sheetId],
  })
  return rows.map(r => toSheetRevision(r as Record<string, unknown>))
}

export async function getRevisionById(id: number): Promise<InventorySheetRevision | null> {
  const db = await getDb()
  const { rows } = await db.execute({ sql: 'SELECT * FROM inventory_sheet_revisions WHERE id = ?', args: [id] })
  return rows[0] ? toSheetRevision(rows[0] as Record<string, unknown>) : null
}

// ── Audit log ────────────────────────────────────────────────────────────────────

export async function logSheetEvent(
  sheetId: number,
  eventType: SheetEventType,
  actor: string | null,
  opts?: { relatedSheetId?: number | null; revisionId?: number | null; detail?: Record<string, unknown> | null },
): Promise<void> {
  const db = await getDb()
  await db.execute({
    sql: `INSERT INTO inventory_sheet_events (sheet_id, event_type, actor, related_sheet_id, revision_id, detail_json)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      sheetId, eventType, actor,
      opts?.relatedSheetId ?? null, opts?.revisionId ?? null,
      opts?.detail ? JSON.stringify(opts.detail) : null,
    ],
  })
}

export async function getSheetEvents(sheetId: number): Promise<InventorySheetEvent[]> {
  const db = await getDb()
  const { rows } = await db.execute({
    sql: 'SELECT * FROM inventory_sheet_events WHERE sheet_id = ? ORDER BY event_at ASC, id ASC',
    args: [sheetId],
  })
  return rows.map(r => toSheetEvent(r as Record<string, unknown>))
}

export async function getChainEvents(sheetIds: number[]): Promise<InventorySheetEvent[]> {
  if (sheetIds.length === 0) return []
  const db = await getDb()
  const { rows } = await db.execute({
    sql: `SELECT * FROM inventory_sheet_events WHERE sheet_id IN (${sheetIds.map(() => '?').join(',')}) ORDER BY event_at ASC, id ASC`,
    args: sheetIds,
  })
  return rows.map(r => toSheetEvent(r as Record<string, unknown>))
}

// ── Chain / recount relationships ────────────────────────────────────────────────

export async function getRecountOf(sheetId: number): Promise<InventorySheet | null> {
  const sheet = await getSheetById(sheetId)
  if (!sheet?.original_sheet_id) return null
  return getSheetById(sheet.original_sheet_id)
}

/** The sheet currently superseding this one, if any (0 or 1 row — only a submitted
 * successor counts as "the" active recount; abandoned draft attempts don't). */
export async function getRecountedBy(sheetId: number): Promise<InventorySheet | null> {
  const db = await getDb()
  const { rows } = await db.execute({
    sql: `SELECT * FROM inventory_sheets WHERE original_sheet_id = ? AND status = 'submitted'`,
    args: [sheetId],
  })
  return rows[0] ? toSheet(rows[0] as Record<string, unknown>) : null
}

export async function getRecountAttempts(sheetId: number): Promise<InventorySheet[]> {
  const db = await getDb()
  const { rows } = await db.execute({
    sql: `SELECT * FROM inventory_sheets WHERE original_sheet_id = ? ORDER BY created_at ASC`,
    args: [sheetId],
  })
  return rows.map(r => toSheet(r as Record<string, unknown>))
}

/** Walks the chain root→tip, capped to guard against accidental cycles. Read-only
 * display concern (side-by-side / history views) — aggregation never needs this. */
export async function getFullChain(sheetId: number, maxHops = 50): Promise<InventorySheet[]> {
  let current = await getSheetById(sheetId)
  if (!current) return []

  // Walk backward to the root.
  let hops = 0
  while (current.original_sheet_id != null && hops < maxHops) {
    const prev = await getSheetById(current.original_sheet_id)
    if (!prev) break
    current = prev
    hops++
  }

  // Walk forward from the root, collecting every link.
  const chain: InventorySheet[] = [current]
  hops = 0
  while (hops < maxHops) {
    const next = await getRecountAttemptsSubmittedOnly(chain[chain.length - 1].id)
    if (!next) break
    chain.push(next)
    hops++
  }
  return chain
}

async function getRecountAttemptsSubmittedOnly(sheetId: number): Promise<InventorySheet | null> {
  return getRecountedBy(sheetId)
}

// ── Aggregation / summary ────────────────────────────────────────────────────────

interface AggregationFilters {
  inventory_date?: string
  building?: string | string[]
  location_option?: string | string[]
  linen_owner?: string | string[]
  personnel?: string | string[]
}

function buildAggregationWhere(filters: AggregationFilters, alias: string): { clause: string; args: string[] } {
  const clauses: string[] = [`${alias}.status = 'submitted'`]
  const args: string[] = []
  if (filters.inventory_date) { clauses.push(`${alias}.inventory_date = ?`); args.push(filters.inventory_date) }
  addInClause(clauses, args, `${alias}.building`, filters.building)
  addInClause(clauses, args, `${alias}.location_option`, filters.location_option)
  addInClause(clauses, args, `${alias}.linen_owner`, filters.linen_owner)
  addInClause(clauses, args, `${alias}.personnel_name`, filters.personnel)
  return { clause: clauses.join(' AND '), args }
}

export interface OverviewStats {
  totalSubmitted: number
  totalItemsCounted: number
  totalPiecesCounted: number
  totalBuildings: number
  totalLocations: number
  sheetsNov9: number
  sheetsNov10: number
  needingReview: number
}

function firstCell(rows: unknown[]): number {
  if (!rows[0]) return 0
  const row = rows[0] as Record<string, unknown>
  const value = Object.values(row)[0]
  return value == null ? 0 : Number(value)
}

/** Each stat is its own standalone query with its own fresh args array — deliberately
 * not packed into a shared multi-aggregate SELECT, after a packed version was found
 * to intermittently undercount in production in a way that couldn't be reproduced by
 * running the identical SQL text inline outside this function. Simpler and easier to
 * reason about either way. */
export async function getOverviewStats(filters: AggregationFilters): Promise<OverviewStats> {
  const db = await getDb()

  async function scalar(sql: string, args: string[]): Promise<number> {
    const result = await db.execute({ sql, args: [...args] })
    return firstCell(result.rows)
  }

  const { clause, args } = buildAggregationWhere(filters, 's')

  const [
    totalSubmitted,
    totalBuildings,
    totalLocations,
    sheetsNov9,
    sheetsNov10,
    needingReview,
    totalPiecesCounted,
    totalItemsCounted,
  ] = await Promise.all([
    scalar(`SELECT COUNT(*) FROM inventory_sheets s WHERE ${clause}`, args),
    scalar(`SELECT COUNT(DISTINCT s.building) FROM inventory_sheets s WHERE ${clause}`, args),
    scalar(`SELECT COUNT(DISTINCT s.building || '|' || s.location_label) FROM inventory_sheets s WHERE ${clause}`, args),
    scalar(`SELECT COUNT(*) FROM inventory_sheets s WHERE ${clause} AND s.inventory_date = '2026-11-09'`, args),
    scalar(`SELECT COUNT(*) FROM inventory_sheets s WHERE ${clause} AND s.inventory_date = '2026-11-10'`, args),
    scalar(`SELECT COUNT(*) FROM inventory_sheets s WHERE ${clause} AND s.needs_review = 1`, args),
    scalar(
      `SELECT SUM(si.quantity) FROM inventory_sheet_items si JOIN inventory_sheets s ON s.id = si.sheet_id
       WHERE ${clause} AND si.quantity IS NOT NULL`,
      args,
    ),
    scalar(
      `SELECT COUNT(si.quantity) FROM inventory_sheet_items si JOIN inventory_sheets s ON s.id = si.sheet_id
       WHERE ${clause} AND si.quantity IS NOT NULL`,
      args,
    ),
  ])

  return {
    totalSubmitted, totalItemsCounted, totalPiecesCounted, totalBuildings, totalLocations,
    sheetsNov9, sheetsNov10, needingReview,
  }
}

export interface ItemBreakdownRow {
  item_key: string
  item_label: string
  category: string
  total_pieces: number
  sheets_counted: number
}

export async function getItemBreakdown(filters: AggregationFilters): Promise<ItemBreakdownRow[]> {
  const db = await getDb()
  const { clause, args } = buildAggregationWhere(filters, 's')
  const { rows } = await db.execute({
    sql: `SELECT si.item_key AS item_key, MAX(si.item_label) AS item_label, si.category AS category,
                 SUM(si.quantity) AS total_pieces, COUNT(si.quantity) AS sheets_counted
          FROM inventory_sheet_items AS si
          INNER JOIN inventory_sheets AS s ON s.id = si.sheet_id
          WHERE si.quantity IS NOT NULL AND ${clause}
          GROUP BY si.item_key, si.category
          ORDER BY si.category ASC, si.item_key ASC`,
    args: [...args],
  })
  return rows.map(r => {
    const row = r as Record<string, unknown>
    return {
      item_key: String(row.item_key),
      item_label: String(row.item_label),
      category: String(row.category),
      total_pieces: Number(row.total_pieces ?? 0),
      sheets_counted: Number(row.sheets_counted ?? 0),
    }
  })
}

export async function getBuildingLocationBreakdown(filters: AggregationFilters): Promise<
  { building: string; location_label: string; linen_owner: string; sheet_count: number; total_pieces: number }[]
> {
  const db = await getDb()
  const { clause, args } = buildAggregationWhere(filters, 's')
  const { rows } = await db.execute({
    sql: `SELECT s.building AS building, s.location_label AS location_label, s.linen_owner AS linen_owner,
                 COUNT(DISTINCT s.id) AS sheet_count, COALESCE(SUM(si.quantity), 0) AS total_pieces
          FROM inventory_sheets AS s
          LEFT JOIN inventory_sheet_items AS si ON si.sheet_id = s.id AND si.quantity IS NOT NULL
          WHERE ${clause}
          GROUP BY s.building, s.location_label, s.linen_owner
          ORDER BY s.building ASC, s.location_label ASC`,
    args: [...args],
  })
  return rows.map(r => {
    const row = r as Record<string, unknown>
    return {
      building: String(row.building), location_label: String(row.location_label), linen_owner: String(row.linen_owner),
      sheet_count: Number(row.sheet_count ?? 0), total_pieces: Number(row.total_pieces ?? 0),
    }
  })
}

export async function listSummaryRecords(
  filters: SheetFilters,
): Promise<{ sheets: (InventorySheet & { total_pieces: number })[]; total: number }> {
  const db = await getDb()
  const clauses: string[] = []
  const baseArgs: (string | number)[] = []
  const statuses = filters.status ? (Array.isArray(filters.status) ? filters.status : [filters.status]) : ['submitted', 'superseded']
  clauses.push(`s.status IN (${statuses.map(() => '?').join(',')})`)
  baseArgs.push(...statuses)
  if (filters.inventory_date) { clauses.push('s.inventory_date = ?'); baseArgs.push(filters.inventory_date) }
  addInClause(clauses, baseArgs, 's.building', filters.building)
  addInClause(clauses, baseArgs, 's.location_option', filters.location_option)
  addInClause(clauses, baseArgs, 's.linen_owner', filters.linen_owner)
  addInClause(clauses, baseArgs, 's.personnel_name', filters.personnel)
  if (filters.needs_review) { clauses.push('s.needs_review = 1') }
  const where = `WHERE ${clauses.join(' AND ')}`

  const countResult = await db.execute({ sql: `SELECT COUNT(s.id) AS matching_count FROM inventory_sheets s ${where}`, args: [...baseArgs] })
  const total = firstCell(countResult.rows)

  const page = filters.page ?? 1
  const limit = filters.limit ?? 20
  const offset = (page - 1) * limit
  const { rows } = await db.execute({
    sql: `SELECT s.*, (
            SELECT COALESCE(SUM(quantity), 0) FROM inventory_sheet_items WHERE sheet_id = s.id AND quantity IS NOT NULL
          ) AS total_pieces
          FROM inventory_sheets s ${where} ORDER BY s.created_at DESC LIMIT ? OFFSET ?`,
    args: [...baseArgs, limit, offset],
  })
  return {
    sheets: rows.map(r => {
      const row = r as Record<string, unknown>
      return { ...toSheet(row), total_pieces: Number(row.total_pieces ?? 0) }
    }),
    total,
  }
}

export async function getDistinctBuildings(): Promise<string[]> {
  const db = await getDb()
  const { rows } = await db.execute({
    sql: `SELECT DISTINCT building AS building FROM inventory_sheets WHERE building <> '' ORDER BY building ASC`,
    args: [],
  })
  return rows.map(r => String((r as Record<string, unknown>).building))
}

export async function getDistinctPersonnel(): Promise<string[]> {
  const db = await getDb()
  const { rows } = await db.execute({
    sql: `SELECT DISTINCT personnel_name AS personnel_name FROM inventory_sheets WHERE personnel_name <> '' ORDER BY personnel_name ASC`,
    args: [],
  })
  return rows.map(r => String((r as Record<string, unknown>).personnel_name))
}

export async function getDistinctCustomItemLabels(): Promise<string[]> {
  const db = await getDb()
  const { rows } = await db.execute(
    `SELECT DISTINCT item_label FROM inventory_sheet_items WHERE is_custom_item = 1 ORDER BY item_label`,
  )
  return rows.map(r => String((r as Record<string, unknown>).item_label))
}
