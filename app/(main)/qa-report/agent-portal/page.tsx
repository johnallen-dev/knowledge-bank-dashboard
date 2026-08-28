import { AgentPortalForm } from '@/components/qa-report/AgentPortalForm'
import { UserCog } from 'lucide-react'

export default function AgentPortalPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <UserCog className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Agent Portal</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Share feedback on your QA experience and your personal improvement plan
          </p>
        </div>
      </div>

      <div className="border rounded-xl bg-card shadow-sm p-6">
        <AgentPortalForm />
      </div>
    </div>
  )
}
