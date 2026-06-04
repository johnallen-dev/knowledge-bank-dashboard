import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  label: string
  value: number | string
  sub?: string
  color?: string
}

export function StatCard({ label, value, sub, color = 'text-foreground' }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}
