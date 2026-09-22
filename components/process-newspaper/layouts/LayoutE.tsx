'use client'
import { HeadlineSlot } from '../slots/HeadlineSlot'
import { StandardSlot } from '../slots/StandardSlot'
import { QuickReminderSlot } from '../slots/QuickReminderSlot'
import { PAPER } from '@/lib/processNewspaper/categoryStyle'
import type { LayoutProps } from './types'

/** Compact Editorial Edition: medium headline, two medium articles, three smaller reminder cards — efficient use of space. */
export function LayoutE({ headline, supporting, onOpen }: LayoutProps) {
  const [s1, s2, s3, s4, s5] = supporting

  return (
    <div className="flex flex-col gap-3">
      <div className="pb-3" style={{ borderBottom: `1px solid ${PAPER.divider}` }}>
        <HeadlineSlot process={headline} onOpen={() => onOpen(headline)} size="medium" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3" style={{ borderBottom: `1px solid ${PAPER.divider}` }}>
        <StandardSlot process={s1} onOpen={() => onOpen(s1)} />
        <div className="sm:border-l pl-4" style={{ borderColor: PAPER.divider }}>
          <StandardSlot process={s2} onOpen={() => onOpen(s2)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[s3, s4, s5].map((p, i) => (
          <div key={p.id} className={i > 0 ? 'sm:border-l pl-3' : ''} style={i > 0 ? { borderColor: PAPER.divider } : undefined}>
            <QuickReminderSlot process={p} onOpen={() => onOpen(p)} />
          </div>
        ))}
      </div>
    </div>
  )
}
