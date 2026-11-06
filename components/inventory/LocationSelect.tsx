'use client'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { LOCATION_GROUPS } from '@/lib/inventory/types'
import type { LocationCategory } from '@/lib/inventory/types'

interface LocationSelectProps {
  category: LocationCategory | ''
  option: string
  label: string
  onChangeCategory: (category: LocationCategory) => void
  onChangeOption: (option: string) => void
  onChangeLabel: (label: string) => void
}

const CATEGORY_KEYS: LocationCategory[] = ['hotel_storeroom', 'laundry']

export function LocationSelect({ category, option, label, onChangeCategory, onChangeOption, onChangeLabel }: LocationSelectProps) {
  const group = category ? LOCATION_GROUPS[category] : null

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Area *</Label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORY_KEYS.map(key => (
            <button
              key={key}
              type="button"
              onClick={() => onChangeCategory(key)}
              className={`border rounded-lg py-3 px-3 text-center text-sm transition-colors ${
                category === key
                  ? 'border-primary bg-primary/5 text-primary font-semibold'
                  : 'border-muted hover:border-primary/50 text-muted-foreground'
              }`}
            >
              {LOCATION_GROUPS[key].label}
            </button>
          ))}
        </div>
      </div>

      {group && (
        <div className="grid grid-cols-2 gap-2">
          {group.options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => onChangeOption(opt)}
              className={`border rounded-lg py-3 px-3 text-center text-xs sm:text-sm transition-colors ${
                option === opt
                  ? 'border-primary bg-primary/5 text-primary font-semibold'
                  : 'border-muted hover:border-primary/50 text-muted-foreground'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="location_label">Name this place (always) *</Label>
        <Input
          id="location_label"
          value={label}
          onChange={e => onChangeLabel(e.target.value)}
          placeholder='e.g. "Storeroom, 2nd floor"'
        />
      </div>
    </div>
  )
}
