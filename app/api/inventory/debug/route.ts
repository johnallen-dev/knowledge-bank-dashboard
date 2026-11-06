import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db/client'
import { getOverviewStats, buildAggregationWhere } from '@/lib/db/queries/inventory'

export const dynamic = 'force-dynamic'

/** Temporary diagnostic route — prints the EXACT clause/args buildAggregationWhere
 * constructs, and runs that exact SQL both via the real function and inline, to find
 * where the two diverge. Remove once the summary-endpoint undercounting bug is
 * diagnosed. */
export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const built = buildAggregationWhere({} as any, 's')

    const db = await getDb()
    const inlineWithBuiltClause = await db.execute({
      sql: `SELECT COUNT(*) as total_submitted FROM inventory_sheets s WHERE ${built.clause}`,
      args: built.args,
    })

    const realOverviewStats = await getOverviewStats({})

    return NextResponse.json({
      builtClause: built.clause,
      builtArgs: built.args,
      inlineWithBuiltClause: inlineWithBuiltClause.rows[0],
      realOverviewStats,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
