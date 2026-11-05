/** "INV-001", "INV-002", … — derived from the autoincrement id, so uniqueness falls
 * directly out of SQLite's atomic id assignment (see lib/db/queries/inventory.ts's
 * createDraftSheet for the two-step insert-then-backfill this formatter supports). */
export function formatSheetNo(id: number): string {
  return `INV-${String(id).padStart(3, '0')}`
}
