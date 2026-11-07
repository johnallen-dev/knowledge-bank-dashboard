'use client'
import { useEffect, useState } from 'react'
import { StatCard } from '@/components/analytics/StatCard'
import type { SummaryFilters } from './InventoryFilters'

interface OverviewStats {
  totalSubmitted: number
  totalItemsCounted: number
  totalPiecesCounted: number
  totalBuildings: number
  totalLocations: number
  sheetsNov9: number
  sheetsNov10: number
  needingReview: number
}

const EMPTY: OverviewStats = {
  totalSubmitted: 0, totalItemsCounted: 0, totalPiecesCounted: 0, totalBuildings: 0,
  totalLocations: 0, sheetsNov9: 0, sheetsNov10: 0, needingReview: 0,
}

function toQuery(filters: SummaryFilters): string {
  const params = new URLSearchParams()
  if (filters.buildings.length) params.set('building', filters.buildings.join(','))
  if (filters.owners.length) params.set('linen_owner', filters.owners.join(','))
  if (filters.personnel.length) params.set('personnel', filters.personnel.join(','))
  if (filters.place.trim()) params.set('location_label', filters.place.trim())
  if (filters.inventory_date) params.set('inventory_date', filters.inventory_date)
  return params.toString()
}

export function InventoryStatCards({ filters, refreshKey }: { filters: SummaryFilters; refreshKey?: number }) {
  const [stats, setStats] = useState<OverviewStats>(EMPTY)

  useEffect(() => {
    fetch(`/api/inventory/summary/overview?${toQuery(filters)}`)
      .then(res => res.json())
      .then(setStats)
      .catch(() => setStats(EMPTY))
  }, [filters, refreshKey])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Sheets Submitted" value={stats.totalSubmitted} />
      <StatCard label="Pieces Counted" value={stats.totalPiecesCounted} sub={`${stats.totalItemsCounted} item lines`} />
      <StatCard label="Properties Covered" value={stats.totalBuildings} />
      <StatCard label="Locations Covered" value={stats.totalLocations} />
      <StatCard label="Nov 9 Sheets" value={stats.sheetsNov9} />
      <StatCard label="Nov 10 Sheets" value={stats.sheetsNov10} />
      <StatCard label="Needing Review" value={stats.needingReview} color={stats.needingReview > 0 ? 'text-red-600' : 'text-foreground'} />
    </div>
  )
}
