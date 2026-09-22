'use client'
import { HeadlineSlot } from '../slots/HeadlineSlot'
import { StandardSlot } from '../slots/StandardSlot'
import { PAPER } from '@/lib/processNewspaper/categoryStyle'
import type { LayoutProps } from './types'

/** Traditional Broadsheet: full-width headline, five supporting flowing across newspaper-style columns. */
export function LayoutC({ headline, supporting, onOpen }: LayoutProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="pb-4" style={{ borderBottom: `1px solid ${PAPER.divider}` }}>
        <HeadlineSlot process={headline} onOpen={() => onOpen(headline)} size="large" />
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
        {supporting.map(p => (
          <div key={p.id} className="break-inside-avoid mb-4 pb-4" style={{ borderBottom: `1px solid ${PAPER.divider}` }}>
            <StandardSlot process={p} onOpen={() => onOpen(p)} />
          </div>
        ))}
      </div>
    </div>
  )
}
