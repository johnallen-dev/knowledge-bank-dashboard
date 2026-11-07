import { NextRequest, NextResponse } from 'next/server'
import { getOverviewStats } from '@/lib/db/queries/inventory'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const stats = await getOverviewStats({
      inventory_date: searchParams.get('inventory_date') ?? undefined,
      building: searchParams.get('building')?.split(',').filter(Boolean) ?? undefined,
      location_option: searchParams.get('location_option')?.split(',').filter(Boolean) ?? undefined,
      linen_owner: searchParams.get('linen_owner')?.split(',').filter(Boolean) ?? undefined,
      personnel: searchParams.get('personnel')?.split(',').filter(Boolean) ?? undefined,
    })
    return NextResponse.json(stats)
  } catch (err) {
    console.error('[GET /api/inventory/summary/overview]', err)
    return NextResponse.json({ error: 'Failed to load overview stats' }, { status: 500 })
  }
}
