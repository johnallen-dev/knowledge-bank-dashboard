'use client'
import { useEffect, useState } from 'react'
import { NewspaperMasthead } from './NewspaperMasthead'
import { DidYouKnowBox } from './DidYouKnowBox'
import { ArticleModal } from './ArticleModal'
import { RegenerateButton } from './RegenerateButton'
import { LayoutA } from './layouts/LayoutA'
import { LayoutB } from './layouts/LayoutB'
import { LayoutC } from './layouts/LayoutC'
import { LayoutD } from './layouts/LayoutD'
import { LayoutE } from './layouts/LayoutE'
import { Newspaper as NewspaperIcon, Printer } from 'lucide-react'
import { PAPER } from '@/lib/processNewspaper/categoryStyle'
import type { NewspaperProcess, TodayEditionResponse, LayoutKey } from '@/lib/processNewspaper/types'

const LAYOUT_COMPONENTS: Record<LayoutKey, typeof LayoutA> = {
  classic: LayoutA,
  modern: LayoutB,
  broadsheet: LayoutC,
  visual: LayoutD,
  compact: LayoutE,
}

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
        <div className="flex justify-end mb-2 print:hidden">
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

  const Layout = LAYOUT_COMPONENTS[edition.layoutKey] ?? LayoutA

  return (
    <div className="mx-auto print:m-0" style={{ maxWidth: 900 }}>
      <div className="flex justify-end gap-2 mb-2 print:hidden">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border rounded-md hover:bg-accent transition-colors"
        >
          <Printer className="h-3.5 w-3.5" />
          Print / Save as PDF
        </button>
        <RegenerateButton onRegenerated={setEdition} />
      </div>

      <div
        id="process-newspaper-page"
        className="border shadow-sm p-5 sm:p-8 flex flex-col print:shadow-none print:border-0 print:p-0"
        style={{ background: PAPER.background, borderColor: PAPER.divider, minHeight: 1000 }}
      >
        <NewspaperMasthead />
        <DidYouKnowBox trivia={edition.trivia} />

        <div className="mt-3 flex-1">
          <Layout headline={edition.headline} supporting={edition.supporting} onOpen={setOpenArticle} />
        </div>

        <div
          className="mt-4 pt-2 flex items-center justify-center gap-3 text-[9px] font-bold uppercase tracking-[0.15em] shrink-0"
          style={{ borderTop: `1px solid ${PAPER.primaryText}`, color: PAPER.secondaryText }}
        >
          <span>Same Processes</span>
          <span style={{ color: PAPER.divider }}>|</span>
          <span>Same Team</span>
          <span style={{ color: PAPER.divider }}>|</span>
          <span>Brighter Days Ahead</span>
        </div>
      </div>

      {openArticle && <ArticleModal process={openArticle} onClose={() => setOpenArticle(null)} />}
    </div>
  )
}
