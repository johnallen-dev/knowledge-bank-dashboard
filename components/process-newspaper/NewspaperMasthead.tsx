'use client'
import { playfairDisplay, caveat } from '@/lib/processNewspaper/fonts'

function getIssueNumber(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  return Math.floor(diff / 86_400_000)
}

export function NewspaperMasthead() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="mb-3 shrink-0">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-[#6b5f4a] leading-tight pt-1.5 shrink-0">
          <p>People</p>
          <p>Processes</p>
          <p>Better Stays</p>
        </div>

        <div className="text-center flex-1 min-w-0">
          <h1 className={`${playfairDisplay.className} text-2xl sm:text-4xl font-black tracking-tight text-[#1a1a1a] leading-none`}>
            PROCESS NEWSPAPER
          </h1>
          <p className="mt-1 text-[9px] sm:text-[11px] uppercase tracking-[0.25em] text-[#8a3324] font-semibold">
            Small Reminders. Bigger Impact.
          </p>
        </div>

        <p className={`${caveat.className} text-base sm:text-lg text-[#6b5f4a] shrink-0 pt-1 -rotate-2 text-right leading-tight`}>
          Same Team,<br />Brighter Days ♡
        </p>
      </div>

      <div className="mt-2 pt-1.5 border-t-2 border-b border-[#1a1a1a] flex items-center justify-between text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] text-[#4a4436] py-1">
        <span>Vol. 1 · No. {getIssueNumber()}</span>
        <span className="text-[#8a3324]">{today}</span>
        <span>Staff Edition</span>
      </div>
    </div>
  )
}
