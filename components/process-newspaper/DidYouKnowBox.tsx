'use client'
import { Lightbulb } from 'lucide-react'
import { playfairDisplay } from '@/lib/processNewspaper/fonts'
import { PAPER, CATEGORY_COLOR } from '@/lib/processNewspaper/categoryStyle'

export function DidYouKnowBox({ trivia }: { trivia: string | null }) {
  if (!trivia) return null
  const color = CATEGORY_COLOR.internal

  return (
    <div
      className="flex items-start sm:items-center gap-2 px-3 py-2 mb-1 shrink-0"
      style={{ borderTop: `1px solid ${PAPER.divider}`, borderBottom: `1px solid ${PAPER.divider}` }}
    >
      <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5 sm:mt-0" style={{ color }} />
      <p className="text-xs leading-snug" style={{ color: PAPER.secondaryText }}>
        <span className={`${playfairDisplay.className} font-black uppercase tracking-[0.08em] mr-1.5`} style={{ color }}>
          Did You Know?
        </span>
        {trivia}
      </p>
    </div>
  )
}
