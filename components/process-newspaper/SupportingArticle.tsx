'use client'
import { CATEGORY_LABELS } from '@/lib/processNewspaper/types'
import { buildPreview } from '@/lib/processNewspaper/preview'
import type { NewspaperProcess } from '@/lib/processNewspaper/types'

interface SupportingArticleProps {
  process: NewspaperProcess
  size: 'medium' | 'small'
  onOpen: () => void
}

export function SupportingArticle({ process, size, onOpen }: SupportingArticleProps) {
  const isMedium = size === 'medium'

  return (
    <article
      onClick={onOpen}
      className="cursor-pointer border-b border-[#d8cfb8] pb-4 mb-4 break-inside-avoid group"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6b5f4a] mb-1.5">
        {CATEGORY_LABELS[process.category]}
      </p>
      <h3 className={`font-serif font-bold leading-snug text-[#1a1a1a] group-hover:underline decoration-2 underline-offset-2 ${isMedium ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'}`}>
        {process.title}
      </h3>
      <p className={`mt-2 text-[#4a4436] font-serif leading-relaxed ${isMedium ? 'text-sm' : 'text-xs'}`}>
        {buildPreview(process.content_html, isMedium ? 160 : 90)}
      </p>
    </article>
  )
}
