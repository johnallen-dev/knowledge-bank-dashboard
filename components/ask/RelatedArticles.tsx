import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import type { KnowledgeEntry } from '@/lib/db/queries/knowledge'

export function RelatedArticles({ entries }: { entries: KnowledgeEntry[] }) {
  if (!entries.length) return null
  return (
    <div className="mt-4 pt-4 border-t">
      <p className="text-xs font-medium text-muted-foreground mb-2">Related Articles</p>
      <ul className="space-y-1.5">
        {entries.slice(0, 5).map((entry) => (
          <li key={entry.id}>
            <Link
              href={`/knowledge-base/${entry.id}`}
              className="flex items-start gap-2 text-sm text-primary hover:underline"
            >
              <BookOpen className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span className="line-clamp-2">{entry.question}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
