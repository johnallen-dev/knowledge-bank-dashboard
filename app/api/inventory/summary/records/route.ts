import { NextRequest, NextResponse } from 'next/server'
import { listSummaryRecords } from '@/lib/db/queries/inventory'
import { getDisplayStatus } from '@/lib/inventory/statusLabel'
import type { SheetStatus } from '@/lib/inventory/types'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const statusParam = searchParams.get('status')
    const result = await listSummaryRecords({
      status: statusParam ? (statusParam.split(',') as SheetStatus[]) : undefined,
      inventory_date: searchParams.get('inventory_date') as never ?? undefined,
      building: searchParams.get('building')?.split(',').filter(Boolean) ?? undefined,
      location_option: searchParams.get('location_option')?.split(',').filter(Boolean) ?? undefined,
      linen_owner: searchParams.get('linen_owner')?.split(',').filter(Boolean) as never ?? undefined,
      personnel: searchParams.get('personnel')?.split(',').filter(Boolean) ?? undefined,
      needs_review: searchParams.get('needs_review') === 'true' ? true : undefined,
      page: Number(searchParams.get('page') ?? 1),
      limit: Number(searchParams.get('limit') ?? 20),
    })
    const sheets = result.sheets.map(s => ({ ...s, displayStatus: getDisplayStatus(s) }))
    return NextResponse.json({ sheets, total: result.total })
  } catch (err) {
    console.error('[GET /api/inventory/summary/records]', err)
    return NextResponse.json({ error: 'Failed to load records' }, { status: 500 })
  }
}
