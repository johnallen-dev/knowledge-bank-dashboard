import { NextRequest, NextResponse } from 'next/server'
import { listAgentFeedback, upsertAgentFeedback, deleteAgentFeedback } from '@/lib/db/queries/qaReports'
import type { RecordType } from '@/lib/qaReport/types'
import { isValidQaReportPassword } from '@/lib/qaReport/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const agents = searchParams.get('agents')
    const feedback = await listAgentFeedback({
      startDate: searchParams.get('startDate') ?? undefined,
      endDate: searchParams.get('endDate') ?? undefined,
      agentNames: agents ? agents.split(',').filter(Boolean) : undefined,
      recordType: (searchParams.get('recordType') as RecordType) ?? 'normal',
    })
    return NextResponse.json({ feedback })
  } catch (err) {
    console.error('[GET /api/qa-report/feedback]', err)
    return NextResponse.json({ error: 'Failed to list agent feedback' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { date, agentName, recordType, qaFeedback, personalImprovementPlan, qaExperienceRating } = body

    if (!date || !agentName?.trim()) {
      return NextResponse.json({ error: 'Date and agent name are required' }, { status: 400 })
    }

    const uniqueId = await upsertAgentFeedback({
      feedback_date: date,
      agent_name: agentName.trim(),
      record_type: (recordType as RecordType) ?? 'normal',
      qa_feedback: qaFeedback ?? '',
      personal_improvement_plan: personalImprovementPlan ?? '',
      qa_experience_rating: qaExperienceRating == null ? null : Number(qaExperienceRating),
    })

    return NextResponse.json({ uniqueId }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/qa-report/feedback]', err)
    return NextResponse.json({ error: 'Failed to submit agent feedback' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? ''
  const password = authHeader.replace(/^Bearer\s+/i, '')
  if (!isValidQaReportPassword(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(req.url)
    const uniqueId = searchParams.get('uniqueId')
    const recordType = (searchParams.get('recordType') as RecordType) ?? 'normal'
    if (!uniqueId) {
      return NextResponse.json({ error: 'uniqueId is required' }, { status: 400 })
    }
    await deleteAgentFeedback(uniqueId, recordType)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/qa-report/feedback]', err)
    return NextResponse.json({ error: 'Failed to delete agent feedback' }, { status: 500 })
  }
}
