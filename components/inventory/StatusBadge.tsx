import { Badge } from '@/components/ui/badge'
import { INVENTORY_STATUS_LABELS } from '@/lib/inventory/types'
import type { DisplayStatus } from '@/lib/inventory/types'

const STATUS_BADGE_VARIANT: Record<DisplayStatus, 'secondary' | 'success' | 'outline' | 'warning'> = {
  draft: 'secondary',
  submitted: 'success',
  recounted: 'outline',
  superseded: 'warning',
}

export function StatusBadge({ status, className }: { status: DisplayStatus; className?: string }) {
  return <Badge variant={STATUS_BADGE_VARIANT[status]} className={className}>{INVENTORY_STATUS_LABELS[status]}</Badge>
}
