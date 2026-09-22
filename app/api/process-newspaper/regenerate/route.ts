import { NextRequest, NextResponse } from 'next/server'
import { forceRegenerateTodayEdition } from '@/lib/processNewspaper/rotation'
import { isValidNewspaperPassword } from '@/lib/processNewspaper/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? ''
  const password = authHeader.replace(/^Bearer\s+/i, '')
  if (!isValidNewspaperPassword(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const edition = await forceRegenerateTodayEdition()
    return NextResponse.json({ edition })
  } catch (err) {
    console.error('[POST /api/process-newspaper/regenerate]', err)
    return NextResponse.json({ error: "Failed to re-create today's edition" }, { status: 500 })
  }
}
