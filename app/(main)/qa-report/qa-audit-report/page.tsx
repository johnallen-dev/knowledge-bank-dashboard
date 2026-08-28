import { QaReportTable } from '@/components/qa-report/QaReportTable'
import { FileBarChart } from 'lucide-react'

export default function QaAuditReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileBarChart className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">QA Report</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            QA performance for individual agents or groups of agents
          </p>
        </div>
      </div>

      <QaReportTable />
    </div>
  )
}
