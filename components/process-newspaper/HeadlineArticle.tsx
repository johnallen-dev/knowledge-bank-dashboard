'use client'
import { ArrowRight, CircleCheck } from 'lucide-react'
import { CATEGORY_LABELS } from '@/lib/processNewspaper/types'
import { extractDekAndBody, extractListItems, buildPreview } from '@/lib/processNewspaper/preview'
import { getArticleEmoji } from '@/lib/processNewspaper/emoji'
import { CATEGORY_COLOR } from '@/lib/processNewspaper/categoryStyle'
import { playfairDisplay, caveat } from '@/lib/processNewspaper/fonts'
import type { NewspaperProcess } from '@/lib/processNewspaper/types'

interface HeadlineArticleProps {
  process: NewspaperProcess
  onOpen: () => void
}

export function HeadlineArticle({ process, onOpen }: HeadlineArticleProps) {
  const color = CATEGORY_COLOR[process.category]
  const { dek, body } = extractDekAndBody(process.content_html)
  const keyPoints = extractListItems(process.content_html, 3)

  return (
    <article className="border-b-2 border-[#1a1a1a] pb-3 mb-3 shrink-0">
      <div className="flex items-start gap-3 cursor-pointer group" onClick={onOpen}>
        <span className="text-4xl sm:text-5xl leading-none shrink-0" aria-hidden>{getArticleEmoji(process)}</span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color }}>
            {CATEGORY_LABELS[process.category]} · Today&apos;s Feature
          </p>
          <h2 className={`${playfairDisplay.className} text-xl sm:text-3xl font-black leading-[1.05] text-[#1a1a1a] group-hover:underline decoration-2 underline-offset-4`}>
            {process.title}
          </h2>
          {dek && (
            <p className={`${playfairDisplay.className} italic text-sm sm:text-base text-[#4a4436] mt-1`}>
              {dek}
            </p>
          )}
        </div>
      </div>

      <p className="mt-2 text-sm sm:text-base leading-snug text-[#33302a] font-serif">
        {buildPreview(body, 200)}
      </p>

      <button
        onClick={onOpen}
        className="mt-2 inline-flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity"
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
                  <span className="text-[10px] leading-tight text-[#4a4436]">{point}</span>
                </div>
              ))}
            </div>
          )}
          {process.special_note && (
            <p className={`${caveat.className} text-lg leading-tight text-[#4a4436] flex-1 min-w-[160px]`}>
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
