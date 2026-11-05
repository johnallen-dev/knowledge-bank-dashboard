import { FIXED_ITEMS, ITEM_CATEGORY_ORDER, ITEM_CATEGORY_LABELS } from './types'
import type { ItemCategory } from './types'
import type { ItemBreakdownRow } from '@/lib/db/queries/inventory'

export interface ShapedItemBreakdownCategory {
  category: ItemCategory
  categoryLabel: string
  items: { item_key: string; item_label: string; total_pieces: number; sheets_counted: number }[]
}

/** Shapes raw aggregation rows into the UI's canonical category order and zero-fills
 * every fixed item that had no contributing sheets, so the Summary's item breakdown
 * always renders all 13 fixed rows (with 0 pieces, not a missing row) plus whatever
 * custom items were actually counted. */
export function shapeItemBreakdown(rows: ItemBreakdownRow[]): ShapedItemBreakdownCategory[] {
  const byKey = new Map(rows.map(r => [r.item_key, r]))

  return ITEM_CATEGORY_ORDER.map(category => {
    const items: ShapedItemBreakdownCategory['items'] = []

    if (category !== 'other') {
      for (const fixed of FIXED_ITEMS[category]) {
        const row = byKey.get(fixed.key)
        items.push({
          item_key: fixed.key,
          item_label: fixed.label,
          total_pieces: row?.total_pieces ?? 0,
          sheets_counted: row?.sheets_counted ?? 0,
        })
      }
    } else {
      for (const row of rows.filter(r => r.category === 'other')) {
        items.push({
          item_key: row.item_key, item_label: row.item_label,
          total_pieces: row.total_pieces, sheets_counted: row.sheets_counted,
        })
      }
    }

    return { category, categoryLabel: ITEM_CATEGORY_LABELS[category], items }
  })
}
