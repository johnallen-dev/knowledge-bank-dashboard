'use client'
import { CATEGORY_LABELS } from '@/lib/processNewspaper/types'
import { getDisplaySummary, extractTakeaway } from '@/lib/processNewspaper/preview'
import { ArticleIcon } from '@/lib/processNewspaper/icons'
import { CATEGORY_COLOR, CATEGORY_TINT } from '@/lib/processNewspaper/categoryStyle'
import { playfairDisplay, caveat } from '@/lib/processNewspaper/fonts'
import type { NewspaperProcess } from '@/lib/processNewspaper/types'

/** Headline + summary + a highlighted key takeaway — e.g. "Report early. Keep everyone safe." */
export function QuickReminderSlot({ process, onOpen }: { process: NewspaperProcess; onOpen: () => void }) {
  const color = CATEGORY_COLOR[process.category]
  const takeaway = extractTakeaway(process)

  return (
    <article
      onClick={onOpen}
      className="cursor-pointer h-full min-h-0 overflow-hidden flex flex-col group transition-colors hover:bg-black/[0.02] px-2"
    >
      <div className="flex items-start gap-2">
        <ArticleIcon process={process} size="sm" />
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color }}>
            {CATEGORY_LABELS[process.category]}
          </p>
          <h3 className={`${playfairDisplay.className} font-bold leading-snug text-[#1C1C1C] text-sm group-hover:underline decoration-2 underline-offset-2`}>
            {process.title}
          </h3>
        </div>
      </div>
      <p className="mt-1.5 text-xs text-[#555555] font-serif leading-relaxed line-clamp-4">
        {getDisplaySummary(process, 32)}
      </p>
      {takeaway && (
        <div className="mt-auto pt-1.5 -mx-1 px-1.5 py-1" style={{ background: CATEGORY_TINT[process.category] }}>
          <p className={`${caveat.className} text-sm leading-tight line-clamp-2`} style={{ color }}>
            {takeaway}
          </p>
        </div>
      )}
    </article>
  )
}
