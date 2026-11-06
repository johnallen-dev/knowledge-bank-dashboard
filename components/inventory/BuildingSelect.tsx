'use client'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BUILDING_OPTIONS, OTHER_BUILDING_VALUE } from '@/lib/inventory/types'

interface BuildingSelectProps {
  building: string
  isOther: boolean
  otherName: string
  onChangeBuilding: (building: string, isOther: boolean) => void
  onChangeOtherName: (name: string) => void
}

export function BuildingSelect({ building, isOther, otherName, onChangeBuilding, onChangeOtherName }: BuildingSelectProps) {
  const value = isOther ? OTHER_BUILDING_VALUE : building

  return (
    <div className="space-y-2">
      <Label>Property *</Label>
      <Select
        value={value}
        onValueChange={v => onChangeBuilding(v === OTHER_BUILDING_VALUE ? '' : v, v === OTHER_BUILDING_VALUE)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select property…" />
        </SelectTrigger>
        <SelectContent>
          {BUILDING_OPTIONS.map(b => (
            <SelectItem key={b} value={b}>{b}</SelectItem>
          ))}
          <SelectItem value={OTHER_BUILDING_VALUE}>Other property…</SelectItem>
        </SelectContent>
      </Select>
      {isOther && (
        <Input
          value={otherName}
          onChange={e => onChangeOtherName(e.target.value)}
          placeholder="Enter property name"
        />
      )}
    </div>
  )
}
