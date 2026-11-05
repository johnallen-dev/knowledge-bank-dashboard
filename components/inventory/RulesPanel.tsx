import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ListChecks } from 'lucide-react'
import { INVENTORY_RULES } from '@/lib/inventory/types'

export function RulesPanel() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <ListChecks className="h-4 w-4" />
          Counting Rules
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2 text-xs text-muted-foreground list-decimal list-inside">
          {INVENTORY_RULES.map((rule, i) => (
            <li key={i}>{rule}</li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
