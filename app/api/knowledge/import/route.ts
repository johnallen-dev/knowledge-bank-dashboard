import { NextRequest, NextResponse } from 'next/server'
import { upsertKnowledge } from '@/lib/db/queries/knowledge'

interface ImportEntry {
  question: string
  answer: string
  category_id?: number | null
  tags?: string[]
  source_type?: string
}

export async function POST(req: NextRequest) {
  try {
    const { entries }: { entries: ImportEntry[] } = await req.json()

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: 'No entries provided' }, { status: 400 })
    }

    const results = { created: 0, updated: 0, skipped: 0, errors: [] as string[] }

    for (const entry of entries) {
      if (!entry.question?.trim() || !entry.answer?.trim()) {
        results.skipped++
        continue
      }
      try {
        const { action } = await upsertKnowledge({
          question: entry.question.trim(),
          answer: entry.answer.trim(),
          category_id: entry.category_id ?? null,
          tags: entry.tags ?? [],
          source_type: entry.source_type ?? 'notion_export',
        })
        if (action === 'created') results.created++
        else results.updated++
      } catch {
        results.errors.push(entry.question.slice(0, 60))
        results.skipped++
      }
    }

    return NextResponse.json(results)
  } catch (err) {
    console.error('[POST /api/knowledge/import]', err)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
