import { NextRequest, NextResponse } from 'next/server'
import { getBuildingLocationBreakdown } from '@/lib/db/queries/inventory'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const rows = await getBuildingLocationBreakdown({
      inventory_date: searchParams.get('inventory_date') ?? undefined,
      building: searchParams.get('building')?.split(',').filter(Boolean) ?? undefined,
      location_label: searchParams.get('location_label')?.split(',').filter(Boolean) ?? undefined,
      linen_owner: searchParams.get('linen_owner')?.split(',').filter(Boolean) ?? undefined,
      personnel: searchParams.get('personnel')?.split(',').filter(Boolean) ?? undefined,
    })
    return NextResponse.json({ rows })
  } catch (err) {
    console.error('[GET /api/inventory/summary/breakdown]', err)
    return NextResponse.json({ error: 'Failed to load breakdown' }, { status: 500 })
  }
}
