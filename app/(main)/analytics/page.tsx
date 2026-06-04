export const dynamic = 'force-dynamic'
import { getAnalytics } from '@/lib/db/queries/analytics'
import { StatCard } from '@/components/analytics/StatCard'
import { QuestionsChart } from '@/components/analytics/QuestionsChart'
import { TopQuestionsTable } from '@/components/analytics/TopQuestionsTable'
import { UnansweredList } from '@/components/analytics/UnansweredList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const revalidate = 60

export default async function AnalyticsPage() {
  const data = await getAnalytics()
  const { totals, topQuestions, unanswered, dailyData, matchBreakdown } = data

  const unansweredRate = totals.total > 0
    ? Math.round((totals.unanswered_total / totals.total) * 100)
    : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Usage statistics and insights</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Questions" value={totals.total} />
        <StatCard label="Guest Questions" value={totals.guest_total} color="text-blue-600" />
        <StatCard label="Staff Questions" value={totals.user_total} color="text-indigo-600" />
        <StatCard
          label="Unanswered Rate"
          value={`${unansweredRate}%`}
          sub={`${totals.unanswered_total} questions`}
          color={unansweredRate > 20 ? 'text-destructive' : 'text-green-600'}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Questions Per Day (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <QuestionsChart data={dailyData} />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Most Asked Questions</CardTitle></CardHeader>
          <CardContent><TopQuestionsTable questions={topQuestions} /></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Answer Source Breakdown</CardTitle></CardHeader>
          <CardContent>
            {matchBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {matchBreakdown.map(m => (
                  <div key={m.match_type} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-muted-foreground">{m.match_type} match</span>
                    <span className="font-medium">{m.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Unanswered / Low-Confidence Questions</CardTitle></CardHeader>
        <CardContent><UnansweredList questions={unanswered} /></CardContent>
      </Card>
    </div>
  )
}
