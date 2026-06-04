export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getKnowledgeById, getRevisions } from '@/lib/db/queries/knowledge'
import { KnowledgeForm } from '@/components/knowledge/KnowledgeForm'
import { RevisionHistory } from '@/components/knowledge/RevisionHistory'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: { id: string }
  searchParams: { edit?: string }
}

export default async function KnowledgeDetailPage({ params, searchParams }: Props) {
  const entry = await getKnowledgeById(Number(params.id))
  if (!entry) notFound()

  const revisions = await getRevisions(entry.id)
  const tags: string[] = JSON.parse(entry.tags ?? '[]')

  if (searchParams.edit === '1') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href={`/knowledge-base/${entry.id}`}><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-2xl font-semibold">Edit Entry</h1>
        </div>
        <KnowledgeForm entry={entry} />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/knowledge-base"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-xl font-semibold flex-1 line-clamp-1">{entry.question}</h1>
        <Button asChild variant="outline" size="sm">
          <Link href={`/knowledge-base/${entry.id}?edit=1`}>Edit</Link>
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          {entry.category_name && <Badge variant="outline">{entry.category_name}</Badge>}
          {tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
          <span className="text-xs text-muted-foreground ml-auto">
            Updated {formatDate(entry.updated_at)} · {entry.view_count} views
          </span>
        </div>

        <div className="rounded-lg border p-5 space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Question</p>
            <p className="font-medium">{entry.question}</p>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Answer</p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{entry.answer}</p>
          </div>
          {entry.source_url && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Source</p>
                <a href={entry.source_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
                  {entry.source_url}
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {revisions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Revision History</h2>
          <RevisionHistory revisions={revisions} />
        </div>
      )}
    </div>
  )
}
