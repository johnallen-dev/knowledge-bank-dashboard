import { AgentReportTable } from '@/components/qa-report/AgentReportTable'
import { PasswordGate } from '@/components/qa-report/PasswordGate'
import { Users } from 'lucide-react'

export default function AgentFeedbackReportPage() {
  return (
    <PasswordGate>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Agent Report</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Feedback and improvement plans submitted by agents
            </p>
          </div>
        </div>

        <AgentReportTable />
      </div>
    </PasswordGate>
  )
}
