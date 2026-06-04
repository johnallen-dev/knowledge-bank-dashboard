import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SubmitNewEntryPrompt({ question }: { question: string }) {
  const href = `/knowledge-base/new?q=${encodeURIComponent(question)}`
  return (
    <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-dashed">
      <p className="text-sm text-muted-foreground mb-3">
        No verified answer found. Help improve the knowledge base by adding an answer.
      </p>
      <Button asChild size="sm" variant="outline">
        <Link href={href}>
          <PlusCircle className="h-4 w-4" />
          Add Answer to Knowledge Bank
        </Link>
      </Button>
    </div>
  )
}
