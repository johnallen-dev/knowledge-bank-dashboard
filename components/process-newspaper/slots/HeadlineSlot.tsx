'use client'
import { ArrowRight, CircleCheck } from 'lucide-react'
import { CATEGORY_LABELS } from '@/lib/processNewspaper/types'
import { extractDekAndBody, extractListItems, getDisplaySummary } from '@/lib/processNewspaper/preview'
import { ArticleIcon } from '@/lib/processNewspaper/icons'
import { CATEGORY_COLOR } from '@/lib/processNewspaper/categoryStyle'
import { playfairDisplay, caveat } from '@/lib/processNewspaper/fonts'
import type { NewspaperProcess } from '@/lib/processNewspaper/types'

interface HeadlineSlotProps {
  process: NewspaperProcess
  onOpen: () => void
  size?: 'large' | 'medium'
}

export function HeadlineSlot({ process, onOpen, size = 'large' }: HeadlineSlotProps) {
  const color = CATEGORY_COLOR[process.category]
  const { dek } = extractDekAndBody(process.content_html)
  const keyPoints = extractListItems(process.content_html, 3)
  const summary = getDisplaySummary(process, size === 'large' ? 58 : 42)
  const large = size === 'large'

  return (
    <article
      onClick={onOpen}
      className="cursor-pointer group border-[#1C1C1C] pb-3"
      style={{ borderBottomWidth: 2 }}
    >
      <div className="flex items-start gap-3">
        <ArticleIcon process={process} size={large ? 'lg' : 'md'} />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color }}>
            {CATEGORY_LABELS[process.category]} · Today&apos;s Feature
          </p>
          <h2
            className={`${playfairDisplay.className} font-black leading-[1.05] text-[#1C1C1C] group-hover:underline decoration-2 underline-offset-4 ${large ? 'text-2xl sm:text-4xl' : 'text-xl sm:text-2xl'}`}
          >
            {process.title}
          </h2>
          {dek && (
            <p className={`${playfairDisplay.className} italic text-[#555555] mt-1 ${large ? 'text-sm sm:text-base' : 'text-sm'}`}>
              {dek}
            </p>
          )}
        </div>
      </div>

      <p className={`mt-2 leading-snug text-[#1C1C1C] font-serif ${large ? 'text-sm sm:text-base' : 'text-sm'}`}>
        {summary}
      </p>

      <button
        onClick={e => { e.stopPropagation(); onOpen() }}
        className="mt-2 inline-flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-1.5 hover:opacity-90 transition-opacity"
        style={{ background: color }}
      >
        Read the Full Process
        <ArrowRight className="h-3.5 w-3.5" />
      </button>

      {(keyPoints.length > 0 || process.special_note) && (
        <div className="mt-3 flex flex-wrap items-start gap-x-4 gap-y-2">
          {keyPoints.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {keyPoints.map((point, i) => (
                <div key={i} className="flex items-center gap-1.5 max-w-[140px]">
                  <CircleCheck className="h-4 w-4 shrink-0" style={{ color }} />
                  <span className="text-[10px] leading-tight text-[#555555]">{point}</span>
                </div>
              ))}
            </div>
          )}
          {process.special_note && (
            <p className={`${caveat.className} text-lg leading-tight text-[#555555] flex-1 min-w-[160px]`}>
              <span className="text-2xl align-top mr-0.5" style={{ color }}>&ldquo;</span>
              {process.special_note}
              <span className="text-2xl align-bottom ml-0.5" style={{ color }}>&rdquo;</span>
            </p>
          )}
        </div>
      )}
    </article>
  )
}
