interface TopQuestion {
  question_text: string
  count: number
}

export function TopQuestionsTable({ questions }: { questions: TopQuestion[] }) {
  if (!questions.length) {
    return <p className="text-sm text-muted-foreground py-4">No questions recorded yet.</p>
  }
  const max = questions[0]?.count ?? 1
  return (
    <div className="space-y-3">
      {questions.map((q, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm line-clamp-1 flex-1">{q.question_text}</p>
            <span className="text-sm font-medium tabular-nums shrink-0">{q.count}×</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(q.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
