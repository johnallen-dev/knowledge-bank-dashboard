import { NextRequest, NextResponse } from 'next/server'
import { listAttempts } from '@/lib/db/queries/updates'

const ADMIN_PASSWORD = '00000'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  if (auth !== `Bearer ${ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const search = req.nextUrl.searchParams.get('search') ?? undefined
    const attempts = await listAttempts({ search })
    return NextResponse.json({ attempts })
  } catch (err) {
    console.error('[GET /api/updates/results]', err)
    return NextResponse.json({ error: 'Failed to load results' }, { status: 500 })
  }
}
