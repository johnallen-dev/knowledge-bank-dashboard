'use client'
import { X, Clock, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CATEGORY_LABELS } from '@/lib/processNewspaper/types'
import { formatDuration } from '@/lib/processNewspaper/duration'
import { ArticleIcon } from '@/lib/processNewspaper/icons'
import { PAPER, CATEGORY_COLOR } from '@/lib/processNewspaper/categoryStyle'
import { playfairDisplay } from '@/lib/processNewspaper/fonts'
import type { NewspaperProcess } from '@/lib/processNewspaper/types'

interface ArticleModalProps {
  process: NewspaperProcess
  onClose: () => void
}

export function ArticleModal({ process, onClose }: ArticleModalProps) {
  const color = CATEGORY_COLOR[process.category]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(20,15,5,0.6)' }}>
      <div className="rounded-lg shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col border" style={{ background: PAPER.background, borderColor: PAPER.divider }}>
        <div className="flex items-start justify-between gap-4 px-6 sm:px-8 pt-6 pb-4 border-b" style={{ borderColor: PAPER.divider }}>
          <div className="flex items-start gap-3 min-w-0">
            <ArticleIcon process={process} size="lg" />
            <div className="space-y-2 min-w-0">
              <Badge variant="outline" className="uppercase tracking-wide text-[10px] font-semibold" style={{ borderColor: color, color }}>
                {CATEGORY_LABELS[process.category]}
              </Badge>
              <h2 className={`${playfairDisplay.className} text-2xl sm:text-3xl font-bold leading-tight`} style={{ color: PAPER.primaryText }}>
                {process.title}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="shrink-0 text-muted-foreground hover:text-foreground mt-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 sm:px-8 py-5 space-y-5">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: PAPER.secondaryText }}>
            <Clock className="h-3.5 w-3.5" />
            <span>{formatDuration(process)}</span>
          </div>

          <div
            className="prose prose-sm sm:prose-base max-w-none font-serif prose-headings:font-serif"
            dangerouslySetInnerHTML={{ __html: process.content_html }}
          />

          {process.special_note && (
            <div className="border-l-4 px-4 py-3 flex gap-3" style={{ borderColor: color, background: `${color}14` }}>
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" style={{ color }} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color }}>Special Note</p>
                <p className="text-sm" style={{ color: PAPER.primaryText }}>{process.special_note}</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 sm:px-8 py-3 border-t flex justify-end" style={{ borderColor: PAPER.divider }}>
          <button
            onClick={onClose}
            className="text-sm font-medium px-4 py-2 border rounded-md hover:bg-accent transition-colors"
            style={{ borderColor: PAPER.divider }}
          >
            Back to Newspaper
          </button>
        </div>
      </div>
    </div>
  )
}
