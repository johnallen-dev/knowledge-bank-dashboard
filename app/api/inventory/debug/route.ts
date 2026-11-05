import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db/client'
import { getOverviewStats, listSummaryRecords } from '@/lib/db/queries/inventory'

export const dynamic = 'force-dynamic'

/** Temporary diagnostic route — bypasses all query-building logic to answer one
 * question: does this connection see all rows, or a stale/partial subset? Remove
 * once the summary-endpoint undercounting bug is diagnosed. */
export async function GET() {
  try {
    const db = await getDb()
    const countAll = await db.execute('SELECT COUNT(*) as c FROM inventory_sheets')
    const listAll = await db.execute('SELECT id, sheet_no, status FROM inventory_sheets ORDER BY id')
    const countSubmitted = await db.execute("SELECT COUNT(*) as c FROM inventory_sheets WHERE status = 'submitted'")
    const countSubmittedObjForm = await db.execute({
      sql: "SELECT COUNT(*) as c FROM inventory_sheets s WHERE s.status = 'submitted'",
      args: [],
    })
    const countSubmittedWithJoin = await db.execute({
      sql: `SELECT SUM(si.quantity) as total_pieces, COUNT(si.quantity) as total_items
            FROM inventory_sheet_items si JOIN inventory_sheets s ON s.id = si.sheet_id
            WHERE s.status = 'submitted' AND si.quantity IS NOT NULL`,
      args: [],
    })
    const envInfo = {
      hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
      hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
      tursoUrlPrefix: process.env.TURSO_DATABASE_URL ? process.env.TURSO_DATABASE_URL.slice(0, 20) : null,
      vercelRegion: process.env.VERCEL_REGION ?? null,
      vercelEnv: process.env.VERCEL_ENV ?? null,
    }
    const realOverviewStats = await getOverviewStats({})
    const realRecords = await listSummaryRecords({})

    return NextResponse.json({
      countAll: countAll.rows[0],
      countSubmitted: countSubmitted.rows[0],
      countSubmittedObjForm: countSubmittedObjForm.rows[0],
      countSubmittedWithJoin: countSubmittedWithJoin.rows[0],
      realOverviewStats,
      realRecordsTotal: realRecords.total,
      realRecordsSheetNos: realRecords.sheets.map(s => s.sheet_no),
      listAll: listAll.rows,
      envInfo,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
