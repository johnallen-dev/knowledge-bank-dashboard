'use client'
import { X, Clock, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CATEGORY_LABELS } from '@/lib/processNewspaper/types'
import { formatDuration } from '@/lib/processNewspaper/duration'
import { getArticleEmoji } from '@/lib/processNewspaper/emoji'
import type { NewspaperProcess } from '@/lib/processNewspaper/types'

interface ArticleModalProps {
  process: NewspaperProcess
  onClose: () => void
}

export function ArticleModal({ process, onClose }: ArticleModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(20,15,5,0.6)' }}>
      <div className="bg-[#fdfaf3] rounded-lg shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col border border-[#e5ddc8]">
        <div className="flex items-start justify-between gap-4 px-6 sm:px-8 pt-6 pb-4 border-b border-[#e5ddc8]">
          <div className="flex items-start gap-3 min-w-0">
            <span className="text-4xl leading-none shrink-0" aria-hidden>{getArticleEmoji(process)}</span>
            <div className="space-y-2 min-w-0">
              <Badge variant="outline" className="uppercase tracking-wide text-[10px] font-semibold">
                {CATEGORY_LABELS[process.category]}
              </Badge>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-tight text-[#1a1a1a]">
                {process.title}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="shrink-0 text-muted-foreground hover:text-foreground mt-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 sm:px-8 py-5 space-y-5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatDuration(process)}</span>
          </div>

          <div
            className="prose prose-sm sm:prose-base max-w-none font-serif prose-headings:font-serif"
            dangerouslySetInnerHTML={{ __html: process.content_html }}
          />

          {process.special_note && (
            <div className="rounded-lg border-2 border-amber-300 bg-amber-50 px-4 py-3 flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 mb-1">Special Note</p>
                <p className="text-sm text-amber-900">{process.special_note}</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 sm:px-8 py-3 border-t border-[#e5ddc8] flex justify-end">
          <button
            onClick={onClose}
            className="text-sm font-medium px-4 py-2 rounded-md border border-input hover:bg-accent transition-colors"
          >
            Back to Newspaper
          </button>
        </div>
      </div>
    </div>
  )
}
