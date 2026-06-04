import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils'

interface UnansweredQuestion {
  question_text: string
  section: string
  asked_at: string
}

export function UnansweredList({ questions }: { questions: UnansweredQuestion[] }) {
  if (!questions.length) {
    return <p className="text-sm text-muted-foreground py-4">No unanswered questions. Great job!</p>
  }
  return (
    <div className="space-y-2">
      {questions.map((q, i) => (
        <div key={i} className="flex items-start justify-between gap-4 p-3 rounded-md border hover:bg-muted/30 transition-colors">
          <div className="flex-1 min-w-0">
            <p className="text-sm line-clamp-1">{q.question_text}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={q.section === 'guest' ? 'default' : 'secondary'} className="text-xs capitalize">
                {q.section}
              </Badge>
              <span className="text-xs text-muted-foreground">{formatRelativeTime(q.asked_at)}</span>
            </div>
          </div>
          <Link
            href={`/knowledge-base/new?q=${encodeURIComponent(q.question_text)}`}
            className="shrink-0 text-xs text-primary hover:underline flex items-center gap-1"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Add answer
          </Link>
        </div>
      ))}
    </div>
  )
}
