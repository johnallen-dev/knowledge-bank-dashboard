export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { KnowledgeTable } from '@/components/knowledge/KnowledgeTable'
import { PlusCircle } from 'lucide-react'

export default function KnowledgeBasePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground mt-1">All knowledge entries used to answer questions</p>
        </div>
        <Button asChild>
          <Link href="/knowledge-base/new">
            <PlusCircle className="h-4 w-4" />
            Add Entry
          </Link>
        </Button>
      </div>

      <KnowledgeTable />
    </div>
  )
}
