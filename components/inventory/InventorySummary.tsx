'use client'
import { useState, useCallback } from 'react'
import { InventoryStatCards } from './InventoryStatCards'
import { InventoryFilters } from './InventoryFilters'
import { InventoryItemBreakdown } from './InventoryItemBreakdown'
import { InventoryRecordsTable } from './InventoryRecordsTable'
import type { SummaryFilters } from './InventoryFilters'

const EMPTY_FILTERS: SummaryFilters = { buildings: [], owners: [], personnel: [], places: [], inventory_date: '' }

export function InventorySummary() {
  const [filters, setFilters] = useState<SummaryFilters>(EMPTY_FILTERS)
  // Bumped whenever the records table edits/deletes/flags a sheet, so the stat cards
  // and item breakdown (separate components with their own fetch effects) refresh too
  // instead of showing numbers that no longer match what's in the table.
  const [refreshKey, setRefreshKey] = useState(0)
  const handleDataChanged = useCallback(() => setRefreshKey(k => k + 1), [])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Inventory Summary</h2>
        <p className="text-sm text-muted-foreground">Consolidated totals from the latest valid count for each sheet.</p>
      </div>

      <InventoryStatCards filters={filters} refreshKey={refreshKey} />

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Filters</h3>
        <InventoryFilters filters={filters} onChange={setFilters} />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Item Breakdown</h3>
        <InventoryItemBreakdown filters={filters} refreshKey={refreshKey} />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Detailed Records</h3>
        <InventoryRecordsTable filters={filters} onDataChanged={handleDataChanged} />
      </div>
    </div>
  )
}
