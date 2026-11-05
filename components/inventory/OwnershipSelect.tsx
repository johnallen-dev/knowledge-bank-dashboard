'use client'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { LINEN_OWNER_OPTIONS, LINEN_OWNER_LABELS } from '@/lib/inventory/types'
import type { LinenOwner } from '@/lib/inventory/types'

interface OwnershipSelectProps {
  owner: LinenOwner | ''
  customerName: string
  onChangeOwner: (owner: LinenOwner) => void
  onChangeCustomerName: (name: string) => void
}

export function OwnershipSelect({ owner, customerName, onChangeOwner, onChangeCustomerName }: OwnershipSelectProps) {
  return (
    <div className="space-y-2">
      <Label>Whose Linen? *</Label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {LINEN_OWNER_OPTIONS.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChangeOwner(opt)}
            className={`border rounded-lg py-3 px-2 text-center text-sm transition-colors ${
              owner === opt
                ? 'border-primary bg-primary/5 text-primary font-semibold'
                : 'border-muted hover:border-primary/50 text-muted-foreground'
            }`}
          >
            {LINEN_OWNER_LABELS[opt]}
          </button>
        ))}
      </div>
      {owner === 'customer' && (
        <Input
          value={customerName}
          onChange={e => onChangeCustomerName(e.target.value)}
          placeholder="Customer name"
        />
      )}
      <p className="text-xs text-muted-foreground">
        Note: if a location holds linen for two different owners, fill out two separate sheets — one per owner. Never combine owners on one sheet.
      </p>
    </div>
  )
}
