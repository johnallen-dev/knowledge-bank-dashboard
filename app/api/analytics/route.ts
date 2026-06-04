import { NextResponse } from 'next/server'
import { getAnalytics } from '@/lib/db/queries/analytics'

export async function GET() {
  try {
    return NextResponse.json(await getAnalytics())
  } catch (err) {
    console.error('[GET /api/analytics]', err)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
