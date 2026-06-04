import { NextRequest, NextResponse } from 'next/server'
import { listKnowledge, createKnowledge } from '@/lib/db/queries/knowledge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const result = await listKnowledge({
      q: searchParams.get('q') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      archived: searchParams.get('archived') === 'true',
      page: Number(searchParams.get('page') ?? 1),
      limit: Number(searchParams.get('limit') ?? 20),
    })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[GET /api/knowledge]', err)
    return NextResponse.json({ error: 'Failed to list knowledge' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { question, answer } = body
    if (!question || !answer) {
      return NextResponse.json({ error: 'question and answer are required' }, { status: 400 })
    }
    const id = await createKnowledge(body)
    return NextResponse.json({ id }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/knowledge]', err)
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
  }
}
