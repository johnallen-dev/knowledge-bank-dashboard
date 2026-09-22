'use client'
import { CATEGORY_LABELS } from '@/lib/processNewspaper/types'
import { getDisplaySummary, extractTakeaway } from '@/lib/processNewspaper/preview'
import { ArticleIcon } from '@/lib/processNewspaper/icons'
import { CATEGORY_COLOR } from '@/lib/processNewspaper/categoryStyle'
import { playfairDisplay, caveat } from '@/lib/processNewspaper/fonts'
import type { NewspaperProcess } from '@/lib/processNewspaper/types'

/** Full-width lower-section feature treatment — bigger headline, bigger icon, summary, quote. */
export function FeatureSlot({ process, onOpen }: { process: NewspaperProcess; onOpen: () => void }) {
  const color = CATEGORY_COLOR[process.category]
  const takeaway = extractTakeaway(process)

  return (
    <article
      onClick={onOpen}
      className="cursor-pointer flex items-start gap-4 group transition-colors hover:bg-black/[0.02] px-2 py-1"
    >
      <ArticleIcon process={process} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color }}>
          {CATEGORY_LABELS[process.category]} · Editorial Feature
        </p>
        <h3 className={`${playfairDisplay.className} font-black leading-snug text-[#1C1C1C] text-lg sm:text-xl group-hover:underline decoration-2 underline-offset-2`}>
          {process.title}
        </h3>
        <p className="mt-1 text-sm text-[#555555] font-serif leading-relaxed">
          {getDisplaySummary(process, 45)}
        </p>
        {takeaway && (
          <p className={`${caveat.className} text-base leading-tight mt-1`} style={{ color }}>
            &ldquo;{takeaway}&rdquo;
          </p>
        )}
      </div>
    </article>
  )
}
