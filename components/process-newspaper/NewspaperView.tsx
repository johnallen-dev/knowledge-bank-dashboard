'use client'
import { useEffect, useState } from 'react'
import { NewspaperMasthead } from './NewspaperMasthead'
import { HeadlineArticle } from './HeadlineArticle'
import { SupportingArticle } from './SupportingArticle'
import { DidYouKnowBox } from './DidYouKnowBox'
import { ArticleModal } from './ArticleModal'
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
      <div className="max-w-3xl mx-auto">
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
  const sidebarArticles = edition.supporting.slice(0, 2)
  const columnArticles = edition.supporting.slice(2)

  return (
    <div className="max-w-5xl mx-auto bg-[#fdfaf3] border border-[#e5ddc8] rounded-lg p-6 sm:p-10 shadow-sm">
      <NewspaperMasthead />

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <HeadlineArticle process={headline} onOpen={() => setOpenArticle(headline)} />
        </div>
        <div className="md:col-span-1">
          <DidYouKnowBox trivia={edition.trivia} />
          {sidebarArticles.map(p => (
            <SupportingArticle key={p.id} process={p} size="small" onOpen={() => setOpenArticle(p)} />
          ))}
        </div>
      </div>

      {columnArticles.length > 0 && (
        <div className="mt-4 pt-6 border-t-2 border-[#1a1a1a] columns-1 sm:columns-2 lg:columns-3 gap-8">
          {columnArticles.map((p, i) => (
            <SupportingArticle key={p.id} process={p} size={i < 2 ? 'medium' : 'small'} onOpen={() => setOpenArticle(p)} />
          ))}
        </div>
      )}

      {openArticle && <ArticleModal process={openArticle} onClose={() => setOpenArticle(null)} />}
    </div>
  )
}
