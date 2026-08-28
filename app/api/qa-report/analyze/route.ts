import { NextRequest, NextResponse } from 'next/server'
import { listQaAudits } from '@/lib/db/queries/qaReports'
import { generateQaAnalysis } from '@/lib/ai/qaAnalysis'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { startDate, endDate, agentNames } = body as {
      startDate?: string
      endDate?: string
      agentNames?: string[]
    }

    const audits = await listQaAudits({ startDate, endDate, agentNames, recordType: 'normal' })
    const analysis = await generateQaAnalysis(audits)

    return NextResponse.json({ analysis, auditCount: audits.length })
  } catch (err) {
    console.error('[POST /api/qa-report/analyze]', err)
    return NextResponse.json({ error: 'Failed to generate AI analysis' }, { status: 500 })
  }
}
