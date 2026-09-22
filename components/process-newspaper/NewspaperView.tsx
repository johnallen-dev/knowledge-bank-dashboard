'use client'
import { useEffect, useState } from 'react'
import { NewspaperMasthead } from './NewspaperMasthead'
import { HeadlineArticle } from './HeadlineArticle'
import { SupportingArticle } from './SupportingArticle'
import { DidYouKnowBox } from './DidYouKnowBox'
import { ArticleModal } from './ArticleModal'
import { RegenerateButton } from './RegenerateButton'
import { Newspaper as NewspaperIcon } from 'lucide-react'
import type { NewspaperProcess, TodayEditionResponse } from '@/lib/processNewspaper/types'

export function NewspaperView() {
  const [edition, setEdition] = useState<TodayEditionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [openArticle, setOpenArticle] = useState<NewspaperProcess | null>(null)

  useEffect(() => {
    fetch('/api/process-newspaper/today')
      .then(r => r.json())
      .then(d => setEdition(d.edition))
      .catch(() => setEdition(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="py-24 text-center text-sm text-muted-foreground">Loading today&apos;s edition…</div>
  }

  if (!edition || !edition.headline) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-end mb-2">
          <RegenerateButton onRegenerated={setEdition} />
        </div>
        <NewspaperMasthead />
        <div className="py-16 text-center space-y-3">
          <NewspaperIcon className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">No processes are currently eligible to be featured.</p>
          <p className="text-sm text-muted-foreground">Add or enable processes in the Contents section to publish today&apos;s edition.</p>
        </div>
      </div>
    )
  }

  const headline = edition.headline

  return (
    <div className="mx-auto" style={{ maxWidth: 800 }}>
      <div className="flex justify-end mb-2">
        <RegenerateButton onRegenerated={setEdition} />
      </div>

      <div
        className="bg-[#fdfaf3] border border-[#e5ddc8] rounded-lg shadow-sm p-5 sm:p-7 flex flex-col"
        style={{ minHeight: '1000px' }}
      >
        <NewspaperMasthead />
        <HeadlineArticle process={headline} onOpen={() => setOpenArticle(headline)} />

        <div className="grid grid-cols-2 gap-2.5 flex-1" style={{ gridAutoRows: 'minmax(170px, 1fr)' }}>
          <DidYouKnowBox trivia={edition.trivia} />
          {edition.supporting.map(p => (
            <SupportingArticle key={p.id} process={p} onOpen={() => setOpenArticle(p)} />
          ))}
        </div>

        <div className="mt-4 pt-2 border-t border-[#1a1a1a] flex items-center justify-center gap-3 text-[9px] font-bold uppercase tracking-[0.15em] text-[#6b5f4a] shrink-0">
          <span>Same Processes</span>
          <span className="text-[#c9bd9e]">|</span>
          <span>Same Team</span>
          <span className="text-[#c9bd9e]">|</span>
          <span>Brighter Days Ahead</span>
        </div>
      </div>

      {openArticle && <ArticleModal process={openArticle} onClose={() => setOpenArticle(null)} />}
    </div>
  )
}
