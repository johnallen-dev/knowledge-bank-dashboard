import { NextRequest, NextResponse } from 'next/server'
import { getEscalationReport } from '@/lib/db/queries/qaReports'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const agents = searchParams.get('agents')
    const rows = await getEscalationReport({
      startDate: searchParams.get('startDate') ?? undefined,
      endDate: searchParams.get('endDate') ?? undefined,
      agentNames: agents ? agents.split(',').filter(Boolean) : undefined,
    })
    return NextResponse.json({ rows })
  } catch (err) {
    console.error('[GET /api/qa-report/escalation]', err)
    return NextResponse.json({ error: 'Failed to build escalation report' }, { status: 500 })
  }
}
