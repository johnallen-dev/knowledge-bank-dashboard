'use client'
import { CATEGORY_LABELS } from '@/lib/processNewspaper/types'
import { buildPreview } from '@/lib/processNewspaper/preview'
import { getArticleEmoji } from '@/lib/processNewspaper/emoji'
import type { NewspaperProcess } from '@/lib/processNewspaper/types'

interface HeadlineArticleProps {
  process: NewspaperProcess
  onOpen: () => void
}

export function HeadlineArticle({ process, onOpen }: HeadlineArticleProps) {
  return (
    <article
      onClick={onOpen}
      className="cursor-pointer border-b-2 border-[#1a1a1a] pb-3 mb-3 shrink-0 group"
    >
      <div className="flex items-start gap-3">
        <span className="text-4xl sm:text-5xl leading-none shrink-0" aria-hidden>{getArticleEmoji(process)}</span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a3324] mb-1">
            {CATEGORY_LABELS[process.category]} · Today&apos;s Feature
          </p>
          <h2 className="font-serif text-xl sm:text-3xl font-black leading-[1.05] text-[#1a1a1a] group-hover:underline decoration-2 underline-offset-4">
            {process.title}
          </h2>
        </div>
      </div>
      <p className="mt-2 text-sm sm:text-base leading-snug text-[#33302a] font-serif">
        {buildPreview(process.content_html, 220)}
      </p>
      <p className="mt-1.5 text-xs sm:text-sm font-semibold text-[#8a3324]">Continue reading →</p>
    </article>
  )
}
