import { NextRequest, NextResponse } from 'next/server'
import { listQaAudits, upsertQaAudit } from '@/lib/db/queries/qaReports'
import type { AuditType, RecordType } from '@/lib/qaReport/types'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const agents = searchParams.get('agents')
    const audits = await listQaAudits({
      startDate: searchParams.get('startDate') ?? undefined,
      endDate: searchParams.get('endDate') ?? undefined,
      agentNames: agents ? agents.split(',').filter(Boolean) : undefined,
      auditType: (searchParams.get('auditType') as AuditType) ?? undefined,
      recordType: (searchParams.get('recordType') as RecordType) ?? 'normal',
    })
    return NextResponse.json({ audits })
  } catch (err) {
    console.error('[GET /api/qa-report/audits]', err)
    return NextResponse.json({ error: 'Failed to list QA audits' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      date, agentName, recordType,
      chatEmailScore, callScore, chatEmailSummary, callSummary,
      escalationScore, escalationSummary, remarks,
    } = body

    if (!date || !agentName?.trim()) {
      return NextResponse.json({ error: 'Date and agent name are required' }, { status: 400 })
    }

    const uniqueId = await upsertQaAudit({
      audit_date: date,
      agent_name: agentName.trim(),
      record_type: (recordType as RecordType) ?? 'normal',
      chat_email_score: chatEmailScore === '' || chatEmailScore == null ? null : Number(chatEmailScore),
      call_score: callScore === '' || callScore == null ? null : Number(callScore),
      chat_email_summary: chatEmailSummary ?? '',
      call_summary: callSummary ?? '',
      escalation_score: escalationScore === '' || escalationScore == null ? null : Number(escalationScore),
      escalation_summary: escalationSummary ?? '',
      remarks: remarks ?? '',
    })

    return NextResponse.json({ uniqueId }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/qa-report/audits]', err)
    return NextResponse.json({ error: 'Failed to submit QA audit' }, { status: 500 })
  }
}
