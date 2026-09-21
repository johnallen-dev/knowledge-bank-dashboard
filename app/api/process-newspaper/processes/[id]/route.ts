import { NextRequest, NextResponse } from 'next/server'
import { getProcess, updateProcess, deleteProcess } from '@/lib/db/queries/processNewspaper'
import { validateProcessInput } from '@/lib/processNewspaper/validate'
import { isValidNewspaperPassword } from '@/lib/processNewspaper/auth'
import type { ProcessInput } from '@/lib/processNewspaper/types'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const process = await getProcess(Number(params.id))
    if (!process) return NextResponse.json({ error: 'Process not found' }, { status: 404 })
    return NextResponse.json({ process })
  } catch (err) {
    console.error('[GET /api/process-newspaper/processes/:id]', err)
    return NextResponse.json({ error: 'Failed to load process' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const error = validateProcessInput(body)
    if (error) return NextResponse.json({ error }, { status: 400 })

    const id = Number(params.id)
    const existing = await getProcess(id)
    if (!existing) return NextResponse.json({ error: 'Process not found' }, { status: 404 })

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

    // Rotation history (featured_in_cycle / last_headline_at / last_supporting_at) is
    // intentionally untouched by updateProcess — editing must not reset rotation history.
    await updateProcess(id, input)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PUT /api/process-newspaper/processes/:id]', err)
    return NextResponse.json({ error: 'Failed to update process' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = req.headers.get('authorization') ?? ''
  const password = authHeader.replace(/^Bearer\s+/i, '')
  if (!isValidNewspaperPassword(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await deleteProcess(Number(params.id))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/process-newspaper/processes/:id]', err)
    return NextResponse.json({ error: 'Failed to delete process' }, { status: 500 })
  }
}
