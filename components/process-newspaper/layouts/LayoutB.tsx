'use client'
import { HeadlineSlot } from '../slots/HeadlineSlot'
import { IllustratedSlot } from '../slots/IllustratedSlot'
import { StandardSlot } from '../slots/StandardSlot'
import { PAPER } from '@/lib/processNewspaper/categoryStyle'
import type { LayoutProps } from './types'

/** Modern Editorial Magazine: icon-forward headline with two illustrated articles alongside it, three balanced below. */
export function LayoutB({ headline, supporting, onOpen }: LayoutProps) {
  const [s1, s2, s3, s4, s5] = supporting

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4" style={{ borderBottom: `1px solid ${PAPER.divider}` }}>
        <div className="md:col-span-2">
          <HeadlineSlot process={headline} onOpen={() => onOpen(headline)} size="large" />
        </div>
        <div className="md:col-span-1 flex flex-col gap-3 md:border-l md:pl-4" style={{ borderColor: PAPER.divider }}>
          <IllustratedSlot process={s1} onOpen={() => onOpen(s1)} />
          <div style={{ borderTop: `1px solid ${PAPER.divider}` }} className="pt-3">
            <IllustratedSlot process={s2} onOpen={() => onOpen(s2)} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[s3, s4, s5].map((p, i) => (
          <div key={p.id} className={i > 0 ? 'sm:border-l pl-4' : ''} style={i > 0 ? { borderColor: PAPER.divider } : undefined}>
            <StandardSlot process={p} onOpen={() => onOpen(p)} />
          </div>
        ))}
      </div>
    </div>
  )
}
