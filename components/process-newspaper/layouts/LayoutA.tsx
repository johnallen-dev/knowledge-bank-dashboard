'use client'
import { HeadlineSlot } from '../slots/HeadlineSlot'
import { DidYouKnowSlot } from '../slots/DidYouKnowSlot'
import { StandardSlot } from '../slots/StandardSlot'
import { FeatureSlot } from '../slots/FeatureSlot'
import { PAPER } from '@/lib/processNewspaper/categoryStyle'
import type { LayoutProps } from './types'

/** Classic: large headline upper-left, one supporting upper-right, three columns below, one full-width feature at the bottom. */
export function LayoutA({ headline, supporting, onOpen }: LayoutProps) {
  const [s1, s2, s3, s4, s5] = supporting

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4" style={{ borderBottom: `1px solid ${PAPER.divider}` }}>
        <div className="md:col-span-2">
          <HeadlineSlot process={headline} onOpen={() => onOpen(headline)} size="large" />
        </div>
        <div className="md:col-span-1">
          <DidYouKnowSlot process={s1} onOpen={() => onOpen(s1)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4" style={{ borderBottom: `1px solid ${PAPER.divider}` }}>
        {[s2, s3, s4].map((p, i) => (
          <div key={p.id} className={i > 0 ? 'sm:border-l pl-4' : ''} style={i > 0 ? { borderColor: PAPER.divider } : undefined}>
            <StandardSlot process={p} onOpen={() => onOpen(p)} />
          </div>
        ))}
      </div>

      <FeatureSlot process={s5} onOpen={() => onOpen(s5)} />
    </div>
  )
}
