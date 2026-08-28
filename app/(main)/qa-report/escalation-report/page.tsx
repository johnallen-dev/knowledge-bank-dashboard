import { EscalationReportTable } from '@/components/qa-report/EscalationReportTable'
import { ShieldAlert } from 'lucide-react'

export default function EscalationReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <ShieldAlert className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Escalation Report</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Combined escalation audits and agent responses, matched by Unique ID
          </p>
        </div>
      </div>

      <EscalationReportTable />
    </div>
  )
}
