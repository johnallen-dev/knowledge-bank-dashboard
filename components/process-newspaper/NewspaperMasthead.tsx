'use client'
import { playfairDisplay, caveat } from '@/lib/processNewspaper/fonts'
import { PAPER, CATEGORY_COLOR } from '@/lib/processNewspaper/categoryStyle'

function getIssueNumber(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  return Math.floor(diff / 86_400_000)
}

export function NewspaperMasthead() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).toUpperCase()

  return (
    <div className="mb-3 shrink-0">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] leading-tight pt-1.5 shrink-0" style={{ color: PAPER.secondaryText }}>
          <p>People</p>
          <p>Processes</p>
          <p>Better Stays</p>
        </div>

        <div className="text-center flex-1 min-w-0">
          <h1 className={`${playfairDisplay.className} text-2xl sm:text-4xl font-black tracking-tight leading-none`} style={{ color: PAPER.primaryText }}>
            PROCESS NEWSPAPER
          </h1>
          <p className="mt-1 text-[9px] sm:text-[11px] uppercase tracking-[0.25em] font-semibold" style={{ color: CATEGORY_COLOR.guest_related }}>
            Small Reminders. Bigger Impact.
          </p>
        </div>

        <p className={`${caveat.className} text-base sm:text-lg shrink-0 pt-1 -rotate-2 text-right leading-tight`} style={{ color: PAPER.secondaryText }}>
          Same Team,<br />Brighter Days ♡
        </p>
      </div>

      <div
        className="mt-2 pt-1.5 pb-1 flex items-center justify-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em]"
        style={{ borderTop: `2px solid ${PAPER.primaryText}`, borderBottom: `1px solid ${PAPER.primaryText}`, color: PAPER.secondaryText }}
      >
        <span>Vol. 1</span>
        <span>|</span>
        <span>No. {getIssueNumber()}</span>
        <span>|</span>
        <span style={{ color: CATEGORY_COLOR.guest_related }}>{today}</span>
        <span>|</span>
        <span>Internal Edition</span>
      </div>
    </div>
  )
}
