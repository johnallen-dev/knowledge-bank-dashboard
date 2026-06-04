import { Badge } from '@/components/ui/badge'
import { confidenceLabel } from '@/lib/ai/confidence'

export function ConfidenceBadge({ score }: { score: number }) {
  const label = confidenceLabel(score)
  const pct = Math.round(score * 100)

  if (label === 'high') return <Badge variant="success">High confidence · {pct}%</Badge>
  if (label === 'medium') return <Badge variant="warning">Medium confidence · {pct}%</Badge>
  return <Badge variant="danger">Low confidence · {pct}%</Badge>
}
