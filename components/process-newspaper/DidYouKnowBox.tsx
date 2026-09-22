'use client'
import { Lightbulb } from 'lucide-react'
import { playfairDisplay } from '@/lib/processNewspaper/fonts'

export function DidYouKnowBox({ trivia }: { trivia: string | null }) {
  if (!trivia) return null

  return (
    <div className="border border-[#e8c9a0] rounded-sm bg-[#fdf6ea] flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f6dfc0]">
        <Lightbulb className="h-3.5 w-3.5 text-[#8a3324] shrink-0" />
        <h4 className={`${playfairDisplay.className} text-xs font-black uppercase tracking-[0.1em] text-[#5b3a1a]`}>
          Did You Know?
        </h4>
      </div>
      <p className="text-xs font-serif leading-relaxed text-[#33302a] line-clamp-8 p-2.5">{trivia}</p>
    </div>
  )
}
