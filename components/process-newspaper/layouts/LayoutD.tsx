'use client'
import { HeadlineSlot } from '../slots/HeadlineSlot'
import { DidYouKnowSlot } from '../slots/DidYouKnowSlot'
import { IllustratedSlot } from '../slots/IllustratedSlot'
import { QuickReminderSlot } from '../slots/QuickReminderSlot'
import { PAPER } from '@/lib/processNewspaper/categoryStyle'
import type { LayoutProps } from './types'

/** Visual Feature Edition: prominent-icon headline, asymmetric mix of illustrated/reminder/reminder-box supporting articles.
 * Degrades gracefully when fewer than 5 supporting articles are available. */
export function LayoutD({ headline, supporting, onOpen }: LayoutProps) {
  const [s1, s2, s3, s4, s5] = supporting
  const anySupporting = supporting.length > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="pb-4" style={{ borderBottom: `1px solid ${PAPER.divider}` }}>
        <HeadlineSlot process={headline} onOpen={() => onOpen(headline)} size="large" />
      </div>

      {anySupporting && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ gridAutoRows: 'minmax(140px, auto)' }}>
          {s1 && (
            <div className="sm:row-span-2">
              <DidYouKnowSlot process={s1} onOpen={() => onOpen(s1)} />
            </div>
          )}
          {s2 && (
            <div className="sm:border-l pl-4" style={{ borderColor: PAPER.divider }}>
              <IllustratedSlot process={s2} onOpen={() => onOpen(s2)} />
            </div>
          )}
          {s3 && (
            <div className="sm:border-l pl-4" style={{ borderColor: PAPER.divider }}>
              <QuickReminderSlot process={s3} onOpen={() => onOpen(s3)} />
            </div>
          )}
          {s4 && (
            <div className="sm:border-l pt-3 sm:pt-0" style={{ borderColor: PAPER.divider, borderTop: `1px solid ${PAPER.divider}` }}>
              <QuickReminderSlot process={s4} onOpen={() => onOpen(s4)} />
            </div>
          )}
          {s5 && (
            <div className="sm:border-l pt-3 sm:pt-0 pl-4" style={{ borderTop: `1px solid ${PAPER.divider}` }}>
              <IllustratedSlot process={s5} onOpen={() => onOpen(s5)} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
