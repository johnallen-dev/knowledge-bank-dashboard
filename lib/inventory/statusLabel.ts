import type { InventorySheet, DisplayStatus } from './types'

/** Draft/Submitted/Superseded live directly on the row; "Recounted" is derived —
 * a submitted sheet that itself replaced an earlier one. See schema.ts's Inventory
 * Module comment for why status stays a 3-state column. */
export function getDisplayStatus(sheet: Pick<InventorySheet, 'status' | 'original_sheet_id'>): DisplayStatus {
  if (sheet.status === 'submitted' && sheet.original_sheet_id != null) return 'recounted'
  return sheet.status
}
