import { NextRequest, NextResponse } from 'next/server'
import { listProcesses, createProcess } from '@/lib/db/queries/processNewspaper'
import { validateProcessInput } from '@/lib/processNewspaper/validate'
import type { ProcessInput } from '@/lib/processNewspaper/types'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const result = await listProcesses({
      q: searchParams.get('q') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      page: Number(searchParams.get('page') ?? 1),
      limit: Number(searchParams.get('limit') ?? 20),
    })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[GET /api/process-newspaper/processes]', err)
    return NextResponse.json({ error: 'Failed to list processes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const error = validateProcessInput(body)
    if (error) return NextResponse.json({ error }, { status: 400 })

    const input: ProcessInput = {
      category: body.category,
      title: String(body.title).trim(),
      content_html: String(body.content_html),
      duration_type: body.duration_type,
      duration_start: body.duration_type === 'date_range' ? body.duration_start : null,
      duration_end: body.duration_type === 'date_range' ? body.duration_end : null,
      duration_note: body.duration_type === 'other' ? String(body.duration_note).trim() : null,
      special_note: body.special_note ? String(body.special_note).trim() : null,
      is_disabled: !!body.is_disabled,
    }

    const id = await createProcess(input)
    return NextResponse.json({ id }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/process-newspaper/processes]', err)
    return NextResponse.json({ error: 'Failed to create process' }, { status: 500 })
  }
}
