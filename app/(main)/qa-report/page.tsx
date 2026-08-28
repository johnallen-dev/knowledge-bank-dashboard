import Link from 'next/link'
import { ClipboardCheck, UserCog, FileBarChart, Users, LayoutDashboard, ClipboardList, ShieldAlert } from 'lucide-react'

const LINKS = [
  { href: '/qa-report/qa-portal', label: 'QA Portal', icon: ClipboardCheck, description: 'Record and submit QA audits for agents' },
  { href: '/qa-report/agent-portal', label: 'Agent Portal', icon: UserCog, description: 'Submit feedback on your QA experience' },
  { href: '/qa-report/qa-audit-report', label: 'QA Report', icon: FileBarChart, description: 'View QA performance and AI-powered analysis' },
  { href: '/qa-report/agent-feedback-report', label: 'Agent Report', icon: Users, description: 'View agent feedback and improvement plans' },
  { href: '/qa-report/overall-report', label: 'Overall Report', icon: LayoutDashboard, description: 'Combined QA performance and agent feedback' },
  { href: '/qa-report/escalation-report', label: 'Escalation Report', icon: ShieldAlert, description: 'Combined escalation audits and agent responses' },
]

export default function QaReportPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <ClipboardList className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">QA Report</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Record QA audits, collect agent feedback, and review combined performance
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {LINKS.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className="border rounded-xl bg-card p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex items-start gap-3"
          >
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <l.icon className="h-4.5 w-4.5 text-primary" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <p className="font-medium">{l.label}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{l.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
