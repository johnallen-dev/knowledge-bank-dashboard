import {
  getSheetById, canCreateRecountOf, markSheetSubmitted, markSheetSuperseded,
  createDraftSheet, logSheetEvent, getFullChain, getSheetItems,
} from '@/lib/db/queries/inventory'
import type { SheetInput, InventorySheet, InventorySheetItem } from './types'

export class RecountConflictError extends Error {}

export async function createRecountDraft(
  originalSheetId: number,
  input: Partial<SheetInput>,
  createdBy: string,
): Promise<InventorySheet> {
  const canRecount = await canCreateRecountOf(originalSheetId)
  if (!canRecount) {
    throw new RecountConflictError('That sheet is no longer the latest valid count for its scope — it may have already been recounted.')
  }
  const sheet = await createDraftSheet({ ...input, original_sheet_id: originalSheetId }, createdBy)
  await logSheetEvent(sheet.id, 'recount_created', createdBy, { relatedSheetId: originalSheetId })
  return sheet
}

export async function submitOriginalSheet(sheetId: number, submittedBy: string): Promise<InventorySheet> {
  const ok = await markSheetSubmitted(sheetId, submittedBy)
  if (!ok) throw new Error('Sheet could not be submitted — it may already be submitted.')
  await logSheetEvent(sheetId, 'submitted', submittedBy)
  const sheet = await getSheetById(sheetId)
  if (!sheet) throw new Error('Sheet not found after submit')
  return sheet
}

/**
 * Order matters here, not a transaction: supersede the original FIRST under a
 * status-guarded UPDATE, and only flip the recount itself to submitted if that
 * guard actually succeeded. A losing concurrent recount against the same original
 * is rejected cleanly (409 to the caller) rather than silently double-applied.
 *
 * Residual risk (documented, matching the existing Process Newspaper mark/revert
 * precedent's same tradeoff): if something else touched this specific recount row
 * in the narrow window between the two guarded updates, the submit step could fail
 * after the original was already superseded. This is an extremely unlikely race
 * given the recount sheet is a single user's own in-progress draft, not shared
 * state — acceptable for this app's scale rather than adding a transaction.
 */
export async function submitRecount(sheetId: number, submittedBy: string): Promise<InventorySheet> {
  const sheet = await getSheetById(sheetId)
  if (!sheet || sheet.original_sheet_id == null) {
    throw new Error('Sheet is not a recount')
  }
  const originalId = sheet.original_sheet_id

  const canRecount = await canCreateRecountOf(originalId)
  if (!canRecount) {
    throw new RecountConflictError('The original sheet has already been recounted by someone else. Refresh and target the latest sheet instead.')
  }

  const supersedeOk = await markSheetSuperseded(originalId)
  if (!supersedeOk) {
    throw new RecountConflictError('The original sheet has already been recounted by someone else. Refresh and target the latest sheet instead.')
  }

  const submitOk = await markSheetSubmitted(sheetId, submittedBy)
  if (!submitOk) {
    throw new Error('Recount sheet could not be submitted — it may already be submitted.')
  }

  await logSheetEvent(originalId, 'superseded', submittedBy, { relatedSheetId: sheetId })
  await logSheetEvent(sheetId, 'became_latest', submittedBy, { relatedSheetId: originalId })

  const updated = await getSheetById(sheetId)
  if (!updated) throw new Error('Sheet not found after submit')
  return updated
}

export async function getChainView(sheetId: number): Promise<{ sheet: InventorySheet; items: InventorySheetItem[] }[]> {
  const chain = await getFullChain(sheetId)
  return Promise.all(chain.map(async sheet => ({ sheet, items: await getSheetItems(sheet.id) })))
}
