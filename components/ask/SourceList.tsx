import { ExternalLink, Database } from 'lucide-react'
import type { Source } from '@/lib/ai/pipeline'

export function SourceList({ sources }: { sources: Source[] }) {
  if (!sources.length) return null
  return (
    <div className="mt-4 pt-4 border-t">
      <p className="text-xs font-medium text-muted-foreground mb-2">Sources</p>
      <ul className="space-y-1">
        {sources.map((s, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
            {s.type === 'notion' ? (
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Database className="h-3.5 w-3.5 shrink-0" />
            )}
            {s.url ? (
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-foreground hover:underline truncate">
                {s.title}
              </a>
            ) : (
              <span className="truncate">{s.title} {s.id ? `(#${s.id})` : ''}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
