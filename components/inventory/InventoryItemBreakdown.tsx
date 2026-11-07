'use client'
import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { SummaryFilters } from './InventoryFilters'

interface CategoryBreakdown {
  category: string
  categoryLabel: string
  items: { item_key: string; item_label: string; total_pieces: number; sheets_counted: number }[]
}

function toQuery(filters: SummaryFilters): string {
  const params = new URLSearchParams()
  if (filters.buildings.length) params.set('building', filters.buildings.join(','))
  if (filters.owners.length) params.set('linen_owner', filters.owners.join(','))
  if (filters.personnel.length) params.set('personnel', filters.personnel.join(','))
  if (filters.places.length) params.set('location_option', filters.places.join(','))
  if (filters.inventory_date) params.set('inventory_date', filters.inventory_date)
  return params.toString()
}

export function InventoryItemBreakdown({ filters, refreshKey }: { filters: SummaryFilters; refreshKey?: number }) {
  const [categories, setCategories] = useState<CategoryBreakdown[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/inventory/summary/items?${toQuery(filters)}`)
      .then(res => res.json())
      .then(data => setCategories(data.categories ?? []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))
  }, [filters, refreshKey])

  if (loading) {
    return <div className="py-8 text-center text-sm text-muted-foreground">Loading item breakdown…</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {categories.map(cat => (
        <Card key={cat.category}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{cat.categoryLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            {cat.items.length === 0 ? (
              <p className="text-xs text-muted-foreground">No items counted yet.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody className="divide-y">
                  {cat.items.map(item => (
                    <tr key={item.item_key}>
                      <td className="py-1.5 pr-2">{item.item_label}</td>
                      <td className="py-1.5 text-right font-medium tabular-nums">{item.total_pieces}</td>
                      <td className="py-1.5 pl-2 text-xs text-muted-foreground text-right w-24">
                        {item.sheets_counted} sheet{item.sheets_counted === 1 ? '' : 's'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
