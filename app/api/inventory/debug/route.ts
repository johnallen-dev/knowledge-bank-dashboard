import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db/client'
import { getOverviewStats } from '@/lib/db/queries/inventory'

export const dynamic = 'force-dynamic'

/** Temporary diagnostic route — runs the EXACT multi-aggregate query shape from
 * getOverviewStats's sheetAgg, inline, to see if the query SHAPE itself (multiple
 * aggregates in one SELECT, no GROUP BY) is what causes the undercount, independent
 * of being inside the function. Remove once diagnosed. */
export async function GET() {
  try {
    const db = await getDb()

    const multiAggInline = await db.execute({
      sql: `SELECT
              COUNT(*) as total_submitted,
              COUNT(DISTINCT building) as total_buildings,
              COUNT(DISTINCT building || '|' || location_label) as total_locations,
              SUM(CASE WHEN inventory_date = '2026-11-09' THEN 1 ELSE 0 END) as sheets_nov9,
              SUM(CASE WHEN inventory_date = '2026-11-10' THEN 1 ELSE 0 END) as sheets_nov10,
              SUM(CASE WHEN needs_review = 1 THEN 1 ELSE 0 END) as needing_review
            FROM inventory_sheets s WHERE s.status = 'submitted'`,
      args: [],
    })

    const simpleCountInline = await db.execute({
      sql: `SELECT COUNT(*) as total_submitted FROM inventory_sheets s WHERE s.status = 'submitted'`,
      args: [],
    })

    const realOverviewStats = await getOverviewStats({})

    return NextResponse.json({
      multiAggInline: multiAggInline.rows[0],
      simpleCountInline: simpleCountInline.rows[0],
      realOverviewStats,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
