import { NextResponse } from 'next/server'
import { getUpdatesAnalytics } from '@/lib/db/queries/updates'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await getUpdatesAnalytics()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[GET /api/updates/analytics]', err)
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
  }
}
