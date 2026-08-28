import { OverallReportTable } from '@/components/qa-report/OverallReportTable'
import { LayoutDashboard } from 'lucide-react'

export default function OverallReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <LayoutDashboard className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Overall Report</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Consolidated QA performance and agent feedback, matched by Unique ID
          </p>
        </div>
      </div>

      <OverallReportTable />
    </div>
  )
}
