'use client'
import { useEffect, useState } from 'react'
import { StatusBadge } from './StatusBadge'
import { getDisplayStatus } from '@/lib/inventory/statusLabel'
import { ITEM_CATEGORY_ORDER, ITEM_CATEGORY_LABELS } from '@/lib/inventory/types'
import type { InventorySheet, InventorySheetItem, ItemCategory } from '@/lib/inventory/types'

interface ChainLink {
  sheet: InventorySheet
  items: InventorySheetItem[]
}

export function InventoryRecountCompare({ sheetId }: { sheetId: number }) {
  const [chain, setChain] = useState<ChainLink[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/inventory/sheets/${sheetId}/chain`)
      .then(res => res.json())
      .then(data => setChain(data.chain ?? []))
      .catch(() => setChain([]))
      .finally(() => setLoading(false))
  }, [sheetId])

  if (loading) return <div className="py-6 text-center text-sm text-muted-foreground">Loading comparison…</div>
  if (chain.length < 2) return <div className="py-6 text-center text-sm text-muted-foreground">This sheet has no recount history yet.</div>

  // Show the two most relevant links: the one before this sheet and this sheet itself,
  // or the full chain if short enough to read comfortably.
  const columns = chain.length > 2 ? chain.slice(-2) : chain

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {columns.map(({ sheet, items }, idx) => {
        const otherItems = idx === 0 ? columns[1]?.items : columns[0]?.items
        const otherByKey = new Map((otherItems ?? []).map(i => [i.item_key, i]))
        return (
          <div key={sheet.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">{sheet.sheet_no}</span>
              <StatusBadge status={getDisplayStatus(sheet)} />
            </div>
            <p className="text-xs text-muted-foreground">{sheet.building} — {sheet.location_label}</p>
            <table className="w-full text-xs">
              <tbody className="divide-y">
                {ITEM_CATEGORY_ORDER.map(category => {
                  const rows = items.filter(i => i.category === category)
                  if (rows.length === 0) return null
                  return (
                    <RowsForCategory
                      key={category}
                      category={category}
                      rows={rows}
                      otherByKey={otherByKey}
                    />
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}

function RowsForCategory({
  category, rows, otherByKey,
}: {
  category: ItemCategory
  rows: InventorySheetItem[]
  otherByKey: Map<string, InventorySheetItem>
}) {
  return (
    <>
      <tr className="bg-muted/30">
        <th colSpan={2} className="py-1 px-1 text-left text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          {ITEM_CATEGORY_LABELS[category]}
        </th>
      </tr>
      {rows.map(item => {
        const other = otherByKey.get(item.item_key)
        const differs = other && other.quantity !== item.quantity
        return (
          <tr key={item.item_key} className={differs ? 'border-l-2 border-amber-400 bg-amber-50' : ''}>
            <td className="py-1 px-1">{item.item_label}</td>
            <td className="py-1 px-1 text-right tabular-nums">{item.quantity ?? '—'}</td>
          </tr>
        )
      })}
    </>
  )
}
