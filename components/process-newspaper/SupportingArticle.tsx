'use client'
import { CATEGORY_LABELS } from '@/lib/processNewspaper/types'
import { buildPreview } from '@/lib/processNewspaper/preview'
import { getArticleEmoji } from '@/lib/processNewspaper/emoji'
import type { NewspaperProcess } from '@/lib/processNewspaper/types'

interface SupportingArticleProps {
  process: NewspaperProcess
  onOpen: () => void
}

export function SupportingArticle({ process, onOpen }: SupportingArticleProps) {
  return (
    <article
      onClick={onOpen}
      className="cursor-pointer border border-[#d8cfb8] rounded-sm bg-white/40 p-2.5 flex flex-col h-full min-h-0 overflow-hidden group"
    >
      <div className="flex items-start gap-2">
        <span className="text-xl leading-none shrink-0" aria-hidden>{getArticleEmoji(process)}</span>
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#6b5f4a]">
            {CATEGORY_LABELS[process.category]}
          </p>
          <h3 className="font-serif font-bold leading-snug text-[#1a1a1a] text-sm group-hover:underline decoration-2 underline-offset-2">
            {process.title}
          </h3>
        </div>
      </div>
      <p className="mt-1.5 text-xs text-[#4a4436] font-serif leading-relaxed line-clamp-8">
        {buildPreview(process.content_html, 320)}
      </p>
    </article>
  )
}
