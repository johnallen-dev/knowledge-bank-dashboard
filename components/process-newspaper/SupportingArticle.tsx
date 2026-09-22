'use client'
import { CATEGORY_LABELS } from '@/lib/processNewspaper/types'
import { buildPreview, extractTakeaway } from '@/lib/processNewspaper/preview'
import { getArticleEmoji } from '@/lib/processNewspaper/emoji'
import { CATEGORY_COLOR, CATEGORY_TINT } from '@/lib/processNewspaper/categoryStyle'
import { playfairDisplay, caveat } from '@/lib/processNewspaper/fonts'
import type { NewspaperProcess } from '@/lib/processNewspaper/types'

interface SupportingArticleProps {
  process: NewspaperProcess
  onOpen: () => void
}

export function SupportingArticle({ process, onOpen }: SupportingArticleProps) {
  const color = CATEGORY_COLOR[process.category]
  const takeaway = extractTakeaway(process)

  return (
    <article
      onClick={onOpen}
      className="cursor-pointer border border-[#d8cfb8] rounded-sm bg-white/40 p-2.5 flex flex-col h-full min-h-0 overflow-hidden group"
    >
      <div className="flex items-start gap-2">
        <span className="text-xl leading-none shrink-0" aria-hidden>{getArticleEmoji(process)}</span>
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color }}>
            {CATEGORY_LABELS[process.category]}
          </p>
          <h3 className={`${playfairDisplay.className} font-bold leading-snug text-[#1a1a1a] text-sm group-hover:underline decoration-2 underline-offset-2`}>
            {process.title}
          </h3>
        </div>
      </div>
      <p className="mt-1.5 text-xs text-[#4a4436] font-serif leading-relaxed line-clamp-6">
        {buildPreview(process.content_html, 260)}
      </p>
      {takeaway && (
        <div
          className="mt-auto pt-1.5 -mx-1 px-1.5 py-1 rounded"
          style={{ background: CATEGORY_TINT[process.category] }}
        >
          <p className={`${caveat.className} text-sm leading-tight line-clamp-2`} style={{ color }}>
            {takeaway}
          </p>
        </div>
      )}
    </article>
  )
}
