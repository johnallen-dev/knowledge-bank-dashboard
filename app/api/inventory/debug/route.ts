import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db/client'
import { getOverviewStats, listSummaryRecords } from '@/lib/db/queries/inventory'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = await getDb()

  const rawAll = await db.execute({ sql: `SELECT id, sheet_no, status, building FROM inventory_sheets ORDER BY id`, args: [] })
  const rawCountLiteral = await db.execute({ sql: `SELECT COUNT(*) AS c FROM inventory_sheets WHERE status = 'submitted'`, args: [] })
  const rawCountBound = await db.execute({ sql: `SELECT COUNT(*) AS c FROM inventory_sheets WHERE status = ?`, args: ['submitted'] })
  const rawCountIn = await db.execute({ sql: `SELECT COUNT(*) AS c FROM inventory_sheets WHERE status IN ('submitted','superseded')`, args: [] })
  const rawRowsLiteral = await db.execute({ sql: `SELECT id, sheet_no FROM inventory_sheets WHERE status = 'submitted' ORDER BY id`, args: [] })

  const fnOverview = await getOverviewStats({})
  const fnRecords = await listSummaryRecords({})

  return NextResponse.json({
    rawAll: rawAll.rows,
    rawCountLiteral: rawCountLiteral.rows,
    rawCountBound: rawCountBound.rows,
    rawCountIn: rawCountIn.rows,
    rawRowsLiteral: rawRowsLiteral.rows,
    fnOverview,
    fnRecordsTotal: fnRecords.total,
    fnRecordsSheetNos: fnRecords.sheets.map(s => s.sheet_no),
  })
}
