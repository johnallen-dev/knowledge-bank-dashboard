import { NextRequest, NextResponse } from 'next/server'
import { listAgentFeedback, upsertAgentFeedback } from '@/lib/db/queries/qaReports'
import type { RecordType } from '@/lib/qaReport/types'

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
