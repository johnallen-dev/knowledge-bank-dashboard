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
        className="bg-[#fdfaf3] border border-[#e5ddc8] rounded-lg shadow-sm p-5 sm:p-7 flex flex-col overflow-y-auto"
        style={{ aspectRatio: '210 / 297' }}
      >
        <NewspaperMasthead />
        <HeadlineArticle process={headline} onOpen={() => setOpenArticle(headline)} />

        <div className="grid grid-cols-2 grid-rows-3 gap-2.5 flex-1 min-h-0 pt-1">
          <DidYouKnowBox trivia={edition.trivia} />
          {edition.supporting.map(p => (
            <SupportingArticle key={p.id} process={p} onOpen={() => setOpenArticle(p)} />
          ))}
        </div>
      </div>

      {openArticle && <ArticleModal process={openArticle} onClose={() => setOpenArticle(null)} />}
    </div>
  )
}
