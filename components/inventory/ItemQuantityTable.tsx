'use client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PlusCircle, Trash2 } from 'lucide-react'
import { ITEM_CATEGORY_ORDER, ITEM_CATEGORY_LABELS } from '@/lib/inventory/types'
import type { ItemRow } from './types'

interface ItemQuantityTableProps {
  items: ItemRow[]
  onChangeQty: (id: string, qty: number | null) => void
  onChangeCustomName: (id: string, name: string) => void
  onAddCustomRow: () => void
  onRemoveCustomRow: (id: string) => void
}

export function ItemQuantityTable({ items, onChangeQty, onChangeCustomName, onAddCustomRow, onRemoveCustomRow }: ItemQuantityTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <p className="px-3 py-2 text-xs text-muted-foreground bg-muted/30 border-b">
        Leave a box blank if not counted. Enter 0 if you counted and found none. Never use a dash or X.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Item</th>
              <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide w-24 sm:w-28">Pieces</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {ITEM_CATEGORY_ORDER.map(category => {
              const rows = items.filter(i => i.category === category)
              return (
                <RowsForCategory
                  key={category}
                  category={category}
                  rows={rows}
                  onChangeQty={onChangeQty}
                  onChangeCustomName={onChangeCustomName}
                  onRemoveCustomRow={onRemoveCustomRow}
                />
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="px-3 py-2 border-t bg-muted/10">
        <Button type="button" variant="ghost" size="sm" onClick={onAddCustomRow} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add row
        </Button>
      </div>
    </div>
  )
}

function RowsForCategory({
  category, rows, onChangeQty, onChangeCustomName, onRemoveCustomRow,
}: {
  category: string
  rows: ItemRow[]
  onChangeQty: (id: string, qty: number | null) => void
  onChangeCustomName: (id: string, name: string) => void
  onRemoveCustomRow: (id: string) => void
}) {
  return (
    <>
      <tr className="bg-muted/30">
        <th colSpan={2} className="px-3 py-1.5 text-left text-[11px] sm:text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {ITEM_CATEGORY_LABELS[category as keyof typeof ITEM_CATEGORY_LABELS]}
        </th>
      </tr>
      {rows.map(row => (
        <tr key={row.id} className="hover:bg-muted/20">
          <td className="px-3 py-2">
            {row.is_custom_item ? (
              <Input
                value={row.item_label}
                onChange={e => onChangeCustomName(row.id, e.target.value)}
                placeholder="Item name"
                className="h-8"
              />
            ) : (
              row.item_label
            )}
          </td>
          <td className="px-2 sm:px-3 py-2">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                value={row.qty === null ? '' : String(row.qty)}
                onChange={e => {
                  const v = e.target.value
                  onChangeQty(row.id, v === '' ? null : Math.max(0, parseInt(v, 10)))
                }}
                placeholder="—"
                className="w-20 sm:w-24 h-8"
              />
              {row.is_custom_item && (
                <button
                  type="button"
                  onClick={() => onRemoveCustomRow(row.id)}
                  aria-label="Remove row"
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </td>
        </tr>
      ))}
    </>
  )
}
