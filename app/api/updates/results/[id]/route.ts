import { NextRequest, NextResponse } from 'next/server'
import { getAttempt } from '@/lib/db/queries/updates'

const ADMIN_PASSWORD = '00000'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = req.headers.get('authorization') ?? ''
  if (auth !== `Bearer ${ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const attempt = await getAttempt(Number(params.id))
    if (!attempt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ attempt })
  } catch (err) {
    console.error('[GET /api/updates/results/:id]', err)
    return NextResponse.json({ error: 'Failed to load record' }, { status: 500 })
  }
}
