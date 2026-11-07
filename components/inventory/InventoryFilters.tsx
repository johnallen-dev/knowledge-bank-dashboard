'use client'
import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MultiSelect } from './MultiSelect'

export interface SummaryFilters {
  buildings: string[]
  owners: string[]
  personnel: string[]
  places: string[]
  inventory_date: string
}

interface FilterOptions {
  buildings: string[]
  owners: { value: string; label: string }[]
  personnel: string[]
  locationLabels: string[]
  dates: { value: string; label: string }[]
}

interface InventoryFiltersProps {
  filters: SummaryFilters
  onChange: (filters: SummaryFilters) => void
}

export function InventoryFilters({ filters, onChange }: InventoryFiltersProps) {
  const [options, setOptions] = useState<FilterOptions>({ buildings: [], owners: [], personnel: [], locationLabels: [], dates: [] })

  useEffect(() => {
    fetch('/api/inventory/filters')
      .then(res => res.json())
      .then(data => setOptions({
        buildings: data.buildings ?? [],
        owners: data.owners ?? [],
        personnel: data.personnel ?? [],
        locationLabels: data.locationLabels ?? [],
        dates: data.dates ?? [],
      }))
      .catch(() => {})
  }, [])

  function set<K extends keyof SummaryFilters>(key: K, value: SummaryFilters[K]) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="space-y-2">
        <Label>Property</Label>
        <MultiSelect
          label="Properties"
          options={options.buildings.map(b => ({ value: b, label: b }))}
          selected={filters.buildings}
          onChange={v => set('buildings', v)}
        />
      </div>
      <div className="space-y-2">
        <Label>Area</Label>
        <MultiSelect
          label="Areas"
          options={options.locationLabels.map(l => ({ value: l, label: l }))}
          selected={filters.places}
          onChange={v => set('places', v)}
        />
      </div>
      <div className="space-y-2">
        <Label>Owner</Label>
        <MultiSelect label="Owners" options={options.owners} selected={filters.owners} onChange={v => set('owners', v)} />
      </div>
      <div className="space-y-2">
        <Label>Date</Label>
        <Select value={filters.inventory_date || 'all'} onValueChange={v => set('inventory_date', v === 'all' ? '' : v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All dates</SelectItem>
            {options.dates.map(d => (
              <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Personnel</Label>
        <MultiSelect
          label="Personnel"
          options={options.personnel.map(p => ({ value: p, label: p }))}
          selected={filters.personnel}
          onChange={v => set('personnel', v)}
        />
      </div>
    </div>
  )
}
