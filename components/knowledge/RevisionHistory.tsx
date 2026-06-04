import { formatDate } from '@/lib/utils'

interface Revision {
  id: number
  question: string
  answer: string
  changed_by: string
  change_note: string | null
  created_at: string
}

export function RevisionHistory({ revisions }: { revisions: Revision[] }) {
  if (!revisions.length) {
    return <p className="text-sm text-muted-foreground">No revision history.</p>
  }
  return (
    <div className="space-y-4">
      {revisions.map((rev) => (
        <div key={rev.id} className="border rounded-md p-4 text-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{rev.changed_by}</span>
            <span>{formatDate(rev.created_at)}</span>
          </div>
          {rev.change_note && (
            <p className="text-xs italic text-muted-foreground">"{rev.change_note}"</p>
          )}
          <div>
            <p className="font-medium text-xs mb-1 text-muted-foreground uppercase tracking-wide">Previous Q</p>
            <p>{rev.question}</p>
          </div>
          <div>
            <p className="font-medium text-xs mb-1 text-muted-foreground uppercase tracking-wide">Previous A</p>
            <p className="line-clamp-3">{rev.answer}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
