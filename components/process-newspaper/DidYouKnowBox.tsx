'use client'
import { Lightbulb } from 'lucide-react'

export function DidYouKnowBox({ trivia }: { trivia: string | null }) {
  if (!trivia) return null

  return (
    <div className="border-2 border-[#1a1a1a] bg-[#f5efdd] rounded-sm p-2.5 flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex items-center gap-1.5 mb-1">
        <Lightbulb className="h-3.5 w-3.5 text-[#8a3324] shrink-0" />
        <h4 className="font-serif text-xs font-black uppercase tracking-[0.1em] text-[#1a1a1a]">
          Did You Know?
        </h4>
      </div>
      <p className="text-xs font-serif leading-relaxed text-[#33302a] line-clamp-8">{trivia}</p>
    </div>
  )
}
