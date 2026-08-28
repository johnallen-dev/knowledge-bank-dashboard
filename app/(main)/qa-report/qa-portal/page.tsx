import { QaPortalForm } from '@/components/qa-report/QaPortalForm'
import { ClipboardCheck } from 'lucide-react'

export default function QaPortalPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <ClipboardCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">QA Portal</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Record a Chat/Email and Call audit for an agent in one submission
          </p>
        </div>
      </div>

      <div className="border rounded-xl bg-card shadow-sm p-6">
        <QaPortalForm />
      </div>
    </div>
  )
}
