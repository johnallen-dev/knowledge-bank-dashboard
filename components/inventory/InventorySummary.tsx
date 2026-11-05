'use client'
import { useState } from 'react'
import { InventoryStatCards } from './InventoryStatCards'
import { InventoryFilters } from './InventoryFilters'
import { InventoryItemBreakdown } from './InventoryItemBreakdown'
import { InventoryRecordsTable } from './InventoryRecordsTable'
import type { SummaryFilters } from './InventoryFilters'

const EMPTY_FILTERS: SummaryFilters = { buildings: [], owners: [], personnel: [], place: '', inventory_date: '' }

export function InventorySummary() {
  const [filters, setFilters] = useState<SummaryFilters>(EMPTY_FILTERS)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Inventory Summary</h2>
        <p className="text-sm text-muted-foreground">Consolidated totals from the latest valid count for each sheet.</p>
      </div>

      <InventoryStatCards filters={filters} />

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Filters</h3>
        <InventoryFilters filters={filters} onChange={setFilters} />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Item Breakdown</h3>
        <InventoryItemBreakdown filters={filters} />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Detailed Records</h3>
        <InventoryRecordsTable filters={filters} />
      </div>
    </div>
  )
}
