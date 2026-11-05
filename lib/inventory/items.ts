import type { SheetInput } from './types'

/** Stable key for a custom "Other Items" row, derived from its label so identically
 * named custom items (e.g. two sheets both logging "Tablecloths") aggregate together
 * in the Summary's item breakdown — see getItemBreakdown's GROUP BY item_key. */
export function slugifyItemName(name: string): string {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  return slug || 'item'
}

/** Drops truly-blank custom rows (no label typed — nothing meaningful to key or
 * store) and recomputes each surviving custom row's item_key from its label,
 * never trusting whatever key the client happened to send. */
export function normalizeItemsForSave(items: SheetInput['items'] | undefined): SheetInput['items'] {
  if (!items) return []
  return items
    .filter(i => !i.is_custom_item || i.item_label.trim() !== '')
    .map(i => i.is_custom_item
      ? { ...i, item_key: `custom:${slugifyItemName(i.item_label)}`, item_label: i.item_label.trim() }
      : i)
}
