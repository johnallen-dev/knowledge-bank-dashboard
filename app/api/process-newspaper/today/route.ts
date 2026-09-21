import { NextResponse } from 'next/server'
import { generateOrGetTodayEdition } from '@/lib/processNewspaper/rotation'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const edition = await generateOrGetTodayEdition()
    return NextResponse.json({ edition })
  } catch (err) {
    console.error('[GET /api/process-newspaper/today]', err)
    return NextResponse.json({ error: 'Failed to load today\'s edition' }, { status: 500 })
  }
}
