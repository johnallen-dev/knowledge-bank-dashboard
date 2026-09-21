'use client'
import { CATEGORY_LABELS } from '@/lib/processNewspaper/types'
import { buildPreview } from '@/lib/processNewspaper/preview'
import type { NewspaperProcess } from '@/lib/processNewspaper/types'

interface HeadlineArticleProps {
  process: NewspaperProcess
  onOpen: () => void
}

export function HeadlineArticle({ process, onOpen }: HeadlineArticleProps) {
  return (
    <article
      onClick={onOpen}
      className="cursor-pointer border-b-2 border-[#1a1a1a] pb-6 mb-6 break-inside-avoid group"
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8a3324] mb-2">
        {CATEGORY_LABELS[process.category]} · Today&apos;s Feature
      </p>
      <h2 className="font-serif text-3xl sm:text-5xl font-black leading-[1.05] text-[#1a1a1a] group-hover:underline decoration-2 underline-offset-4">
        {process.title}
      </h2>
      <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#33302a] font-serif first-letter:text-4xl first-letter:font-black first-letter:mr-1 first-letter:float-left">
        {buildPreview(process.content_html, 320)}
      </p>
      <p className="mt-3 text-sm font-semibold text-[#8a3324]">Continue reading →</p>
    </article>
  )
}
