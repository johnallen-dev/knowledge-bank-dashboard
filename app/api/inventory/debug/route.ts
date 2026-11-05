import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db/client'
import { getOverviewStats, listSummaryRecords } from '@/lib/db/queries/inventory'

export const dynamic = 'force-dynamic'

/** Temporary diagnostic route — isolates whether calling the real aggregation
 * functions FIRST (no prior queries in the request) changes their result, vs
 * calling raw SQL directly. Remove once the summary-endpoint undercounting bug
 * is diagnosed. */
export async function GET() {
  try {
    // Call the real functions FIRST, before anything else touches the DB this request.
    const realOverviewStatsFirst = await getOverviewStats({})
    const realRecordsFirst = await listSummaryRecords({})

    const db = await getDb()
    const countAll = await db.execute('SELECT COUNT(*) as c FROM inventory_sheets')
    const countSubmitted = await db.execute("SELECT COUNT(*) as c FROM inventory_sheets WHERE status = 'submitted'")

    // Call them again, now that other queries have run in this request.
    const realOverviewStatsSecond = await getOverviewStats({})
    const realRecordsSecond = await listSummaryRecords({})

    return NextResponse.json({
      realOverviewStatsFirst,
      realRecordsFirstTotal: realRecordsFirst.total,
      realRecordsFirstSheetNos: realRecordsFirst.sheets.map(s => s.sheet_no),
      countAll: countAll.rows[0],
      countSubmitted: countSubmitted.rows[0],
      realOverviewStatsSecond,
      realRecordsSecondTotal: realRecordsSecond.total,
      realRecordsSecondSheetNos: realRecordsSecond.sheets.map(s => s.sheet_no),
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
