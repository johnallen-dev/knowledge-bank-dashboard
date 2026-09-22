'use client'
import { Lightbulb } from 'lucide-react'
import { CATEGORY_LABELS } from '@/lib/processNewspaper/types'
import { getDisplaySummary } from '@/lib/processNewspaper/preview'
import { CATEGORY_COLOR, CATEGORY_TINT } from '@/lib/processNewspaper/categoryStyle'
import { playfairDisplay } from '@/lib/processNewspaper/fonts'
import type { NewspaperProcess } from '@/lib/processNewspaper/types'

/** Editorial "spotlight box" treatment for a real supporting article — pastel background,
 * lightbulb icon. Deliberately NOT labeled "Did You Know?" — that label is reserved for the
 * separate AI trivia banner (its own fixed spot under the masthead), so the two never collide
 * on the same page and a reader can always tell them apart. */
export function SpotlightSlot({ process, onOpen }: { process: NewspaperProcess; onOpen: () => void }) {
  const color = CATEGORY_COLOR[process.category]

  return (
    <article
      onClick={onOpen}
      className="cursor-pointer h-full flex flex-col group transition-colors hover:bg-black/[0.02]"
      style={{ background: CATEGORY_TINT[process.category] }}
    >
      <div className="flex items-center gap-1.5 px-3 py-2" style={{ borderBottom: `1px solid ${color}33` }}>
        <Lightbulb className="h-3.5 w-3.5 shrink-0" style={{ color }} />
        <h4 className={`${playfairDisplay.className} text-xs font-black uppercase tracking-[0.1em]`} style={{ color }}>
          Quick Insight
        </h4>
      </div>
      <div className="px-3 py-2 flex-1 min-h-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color }}>
          {CATEGORY_LABELS[process.category]}
        </p>
        <h3 className={`${playfairDisplay.className} font-bold leading-snug text-[#1C1C1C] text-sm group-hover:underline decoration-2 underline-offset-2`}>
          {process.title}
        </h3>
        <p className="mt-1.5 text-xs text-[#555555] font-serif leading-relaxed line-clamp-6">
          {getDisplaySummary(process, 40)}
        </p>
      </div>
    </article>
  )
}
