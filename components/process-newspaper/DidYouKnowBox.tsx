'use client'
import { Lightbulb } from 'lucide-react'

export function DidYouKnowBox({ trivia }: { trivia: string | null }) {
  if (!trivia) return null

  return (
    <div className="border-2 border-[#1a1a1a] bg-[#f5efdd] p-5 mb-6 break-inside-avoid">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="h-4 w-4 text-[#8a3324]" />
        <h4 className="font-serif text-sm font-black uppercase tracking-[0.15em] text-[#1a1a1a]">
          Did You Know?
        </h4>
      </div>
      <p className="text-sm font-serif leading-relaxed text-[#33302a]">{trivia}</p>
    </div>
  )
}
