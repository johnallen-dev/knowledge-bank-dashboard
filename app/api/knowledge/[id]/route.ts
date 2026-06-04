import { NextRequest, NextResponse } from 'next/server'
import { getKnowledgeById, updateKnowledge, archiveKnowledge, getRevisions, getKnowledgeSource } from '@/lib/db/queries/knowledge'

const NOTION_SOURCES = new Set(['notion', 'notion_export'])

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const entry = await getKnowledgeById(Number(params.id))
    if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const revisions = await getRevisions(entry.id)
    return NextResponse.json({ ...entry, revisions })
  } catch (err) {
    console.error('[GET /api/knowledge/[id]]', err)
    return NextResponse.json({ error: 'Failed to fetch entry' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { change_note, ...input } = body
    await updateKnowledge(Number(params.id), input, change_note)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PUT /api/knowledge/[id]]', err)
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url)
    const force = searchParams.get('force') === 'true'

    if (!force) {
      const source = await getKnowledgeSource(Number(params.id))
      if (source && NOTION_SOURCES.has(source.source_type)) {
        return NextResponse.json(
          { error: 'This entry was imported from Notion and is protected. Confirm removal explicitly.' },
          { status: 409 }
        )
      }
    }

    await archiveKnowledge(Number(params.id))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/knowledge/[id]]', err)
    return NextResponse.json({ error: 'Failed to archive entry' }, { status: 500 })
  }
}
