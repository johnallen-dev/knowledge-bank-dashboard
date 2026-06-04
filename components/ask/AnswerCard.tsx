import { Card, CardContent } from '@/components/ui/card'
import { ConfidenceBadge } from './ConfidenceBadge'
import { SourceList } from './SourceList'
import { RelatedArticles } from './RelatedArticles'
import { SubmitNewEntryPrompt } from './SubmitNewEntryPrompt'
import { confidenceLabel } from '@/lib/ai/confidence'
import type { PipelineResult } from '@/lib/ai/pipeline'

interface AnswerCardProps {
  question: string
  result: PipelineResult
  section: 'guest' | 'user'
}

export function AnswerCard({ question, result, section }: AnswerCardProps) {
  const level = confidenceLabel(result.confidence)

  if (section === 'guest') {
    if (level === 'low') {
      return (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              I don&apos;t have a verified answer for that question at this time. Please speak with a team member who will be happy to assist you. Is there anything else I can help you with?
            </p>
            <RelatedArticles entries={result.relatedEntries} />
          </CardContent>
        </Card>
      )
    }
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.answer}</p>
        </CardContent>
      </Card>
    )
  }

  // User section
  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-center justify-between">
          <ConfidenceBadge score={result.confidence} />
          <span className="text-xs text-muted-foreground capitalize">{result.matchType} match</span>
        </div>

        {level === 'medium' && (
          <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-md border border-amber-100">
            Based on available information, this appears to be the correct answer. Please verify before acting on it.
          </p>
        )}

        {level === 'low' ? (
          <>
            <p className="text-sm text-muted-foreground">No verified answer found in the knowledge base or Notion.</p>
            <RelatedArticles entries={result.relatedEntries} />
            <SubmitNewEntryPrompt question={question} />
          </>
        ) : (
          <>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.answer}</p>
            <SourceList sources={result.sources} />
            <RelatedArticles entries={result.relatedEntries} />
          </>
        )}
      </CardContent>
    </Card>
  )
}
