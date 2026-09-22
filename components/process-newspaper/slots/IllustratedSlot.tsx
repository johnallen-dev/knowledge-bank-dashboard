'use client'
import { CATEGORY_LABELS } from '@/lib/processNewspaper/types'
import { getDisplaySummary } from '@/lib/processNewspaper/preview'
import { ArticleIcon } from '@/lib/processNewspaper/icons'
import { CATEGORY_COLOR } from '@/lib/processNewspaper/categoryStyle'
import { playfairDisplay } from '@/lib/processNewspaper/fonts'
import type { NewspaperProcess } from '@/lib/processNewspaper/types'

/** More visual weight than Standard — a larger icon "illustration" beside the text. */
export function IllustratedSlot({ process, onOpen }: { process: NewspaperProcess; onOpen: () => void }) {
  const color = CATEGORY_COLOR[process.category]

  return (
    <article
      onClick={onOpen}
      className="cursor-pointer h-full min-h-0 overflow-hidden flex gap-3 items-start group transition-colors hover:bg-black/[0.02] px-2"
    >
      <ArticleIcon process={process} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color }}>
          {CATEGORY_LABELS[process.category]}
        </p>
        <h3 className={`${playfairDisplay.className} font-bold leading-snug text-[#1C1C1C] text-sm sm:text-base group-hover:underline decoration-2 underline-offset-2`}>
          {process.title}
        </h3>
        <p className="mt-1 text-xs text-[#555555] font-serif leading-relaxed line-clamp-5">
          {getDisplaySummary(process, 36)}
        </p>
      </div>
    </article>
  )
}
