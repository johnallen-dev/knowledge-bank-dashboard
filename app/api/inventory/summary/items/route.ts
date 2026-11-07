import { NextRequest, NextResponse } from 'next/server'
import { getItemBreakdown } from '@/lib/db/queries/inventory'
import { shapeItemBreakdown } from '@/lib/inventory/aggregation'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const rows = await getItemBreakdown({
      inventory_date: searchParams.get('inventory_date') ?? undefined,
      building: searchParams.get('building')?.split(',').filter(Boolean) ?? undefined,
      location_label: searchParams.get('location_label')?.split(',').filter(Boolean) ?? undefined,
      linen_owner: searchParams.get('linen_owner')?.split(',').filter(Boolean) ?? undefined,
      personnel: searchParams.get('personnel')?.split(',').filter(Boolean) ?? undefined,
    })
    return NextResponse.json({ categories: shapeItemBreakdown(rows) })
  } catch (err) {
    console.error('[GET /api/inventory/summary/items]', err)
    return NextResponse.json({ error: 'Failed to load item breakdown' }, { status: 500 })
  }
}
