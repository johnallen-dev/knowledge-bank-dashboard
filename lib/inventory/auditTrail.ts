import {
  getSheetById, getSheetItems, snapshotSheetForRevision, applySheetEdit, logSheetEvent,
  getFullChain, getChainEvents,
} from '@/lib/db/queries/inventory'
import { formatSheetNo } from './sheetNumber'
import type { SheetInput, InventorySheet, InventorySheetItem, InventorySheetEvent } from './types'

export interface FieldChange {
  field: string
  oldValue: string
  newValue: string
}

const HEADER_FIELD_LABELS: Record<string, string> = {
  personnel_name: 'Name',
  inventory_date: 'Date',
  building: 'Building',
  location_label: 'Location',
  linen_owner: 'Whose Linen',
  linen_owner_customer_name: 'Customer Name',
  time_of_count: 'Time',
}

function diffHeader(before: InventorySheet, after: InventorySheet): FieldChange[] {
  const changes: FieldChange[] = []
  for (const [field, label] of Object.entries(HEADER_FIELD_LABELS)) {
    const a = String((before as unknown as Record<string, unknown>)[field] ?? '')
    const b = String((after as unknown as Record<string, unknown>)[field] ?? '')
    if (a !== b) changes.push({ field: label, oldValue: a || '(empty)', newValue: b || '(empty)' })
  }
  return changes
}

function diffItems(before: InventorySheetItem[], after: InventorySheetItem[]): FieldChange[] {
  const changes: FieldChange[] = []
  const beforeByKey = new Map(before.map(i => [i.item_key, i]))
  const afterByKey = new Map(after.map(i => [i.item_key, i]))
  const allKeys = new Set([...beforeByKey.keys(), ...afterByKey.keys()])
  for (const key of allKeys) {
    const b = beforeByKey.get(key)
    const a = afterByKey.get(key)
    const bQty = b?.quantity ?? null
    const aQty = a?.quantity ?? null
    if (bQty !== aQty) {
      const label = a?.item_label ?? b?.item_label ?? key
      changes.push({
        field: `Pieces (${label})`,
        oldValue: bQty === null ? '(not counted)' : String(bQty),
        newValue: aQty === null ? '(not counted)' : String(aQty),
      })
    }
  }
  return changes
}

export function buildChangeSummary(
  before: { sheet: InventorySheet; items: InventorySheetItem[] },
  after: { sheet: InventorySheet; items: InventorySheetItem[] },
): FieldChange[] {
  return [...diffHeader(before.sheet, after.sheet), ...diffItems(before.items, after.items)]
}

/** Password-gated edit of an already-submitted sheet. Snapshots the full pre-edit
 * state before applying anything, so nothing is ever silently lost, then logs a
 * single 'edited' event carrying the field-level diff for the audit history view. */
export async function editSubmittedSheet(
  sheetId: number,
  patch: Partial<SheetInput>,
  editedBy: string,
  changeNote: string | null,
): Promise<{ sheet: InventorySheet; changes: FieldChange[] }> {
  const beforeSheet = await getSheetById(sheetId)
  if (!beforeSheet) throw new Error('Sheet not found')
  const beforeItems = await getSheetItems(sheetId)

  const revisionId = await snapshotSheetForRevision(sheetId, editedBy, changeNote)

  const applied = await applySheetEdit(sheetId, patch, editedBy)
  if (!applied) throw new Error('Sheet could not be edited — it must be in submitted status.')

  const afterSheet = await getSheetById(sheetId)
  if (!afterSheet) throw new Error('Sheet not found after edit')
  const afterItems = await getSheetItems(sheetId)

  const changes = buildChangeSummary({ sheet: beforeSheet, items: beforeItems }, { sheet: afterSheet, items: afterItems })

  await logSheetEvent(sheetId, 'edited', editedBy, { revisionId, detail: { changes } })

  return { sheet: afterSheet, changes }
}

export interface HistoryEntry {
  sheetNo: string
  sheetId: number
  eventType: InventorySheetEvent['event_type']
  text: string
  actor: string | null
  eventAt: string
  changes?: FieldChange[]
}

function narrate(event: InventorySheetEvent, sheetNo: string, relatedSheetNo: string | null): string {
  switch (event.event_type) {
    case 'created_draft':
      return `Sheet ${sheetNo} – Draft started.`
    case 'submitted':
      return `Sheet ${sheetNo} – Original count submitted.`
    case 'recount_created':
      return `Sheet ${sheetNo} – Recount created, linked to ${relatedSheetNo ?? 'original sheet'}.`
    case 'superseded':
      return `Sheet ${sheetNo} – Marked as Superseded.`
    case 'became_latest':
      return `Sheet ${sheetNo} – Became the latest valid inventory count.`
    case 'edited':
      return `Sheet ${sheetNo} – Edited by ${event.actor ?? 'an authorized user'}.`
    default:
      return `Sheet ${sheetNo} – ${event.event_type}.`
  }
}

/** Readable "sequence of events" timeline across an entire recount chain, formatted
 * in the exact narrative style the spec asks for (e.g. "Sheet INV-001 – Original
 * count submitted."). */
export async function getReadableHistory(sheetId: number): Promise<HistoryEntry[]> {
  const chain = await getFullChain(sheetId)
  if (chain.length === 0) return []
  const sheetNoById = new Map(chain.map(s => [s.id, s.sheet_no || formatSheetNo(s.id)]))
  const events = await getChainEvents(chain.map(s => s.id))

  return events.map(event => {
    const sheetNo = sheetNoById.get(event.sheet_id) ?? formatSheetNo(event.sheet_id)
    const relatedSheetNo = event.related_sheet_id != null
      ? (sheetNoById.get(event.related_sheet_id) ?? formatSheetNo(event.related_sheet_id))
      : null
    return {
      sheetNo,
      sheetId: event.sheet_id,
      eventType: event.event_type,
      text: narrate(event, sheetNo, relatedSheetNo),
      actor: event.actor,
      eventAt: event.event_at,
      changes: event.detail?.changes as FieldChange[] | undefined,
    }
  })
}
