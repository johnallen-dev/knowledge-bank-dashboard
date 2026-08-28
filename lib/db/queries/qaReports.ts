import { getDb } from '../client'
import { generateUniqueId } from '@/lib/qaReport/uniqueId'
import type { QaAudit, AgentFeedback, OverallReportRow, EscalationReportRow, AuditType, RecordType } from '@/lib/qaReport/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function toQaAudit(row: Record<string, unknown>): QaAudit {
  return {
    unique_id: String(row.unique_id ?? ''),
    record_type: (row.record_type as RecordType) ?? 'normal',
    audit_date: String(row.audit_date ?? ''),
    agent_name: String(row.agent_name ?? ''),
    chat_email_score: row.chat_email_score == null ? null : Number(row.chat_email_score),
    call_score: row.call_score == null ? null : Number(row.call_score),
    chat_email_summary: String(row.chat_email_summary ?? ''),
    call_summary: String(row.call_summary ?? ''),
    escalation_score: row.escalation_score == null ? null : Number(row.escalation_score),
    escalation_summary: String(row.escalation_summary ?? ''),
    remarks: String(row.remarks ?? ''),
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  }
}

function toAgentFeedback(row: Record<string, unknown>): AgentFeedback {
  return {
    unique_id: String(row.unique_id ?? ''),
    record_type: (row.record_type as RecordType) ?? 'normal',
    feedback_date: String(row.feedback_date ?? ''),
    agent_name: String(row.agent_name ?? ''),
    qa_feedback: String(row.qa_feedback ?? ''),
    personal_improvement_plan: String(row.personal_improvement_plan ?? ''),
    qa_experience_rating: row.qa_experience_rating == null ? null : Number(row.qa_experience_rating),
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  }
}

function buildDateAgentWhere(
  dateCol: string,
  agentCol: string,
  recordType: RecordType,
  filter?: { startDate?: string; endDate?: string; agentNames?: string[] }
): { clause: string; args: (string | number)[] } {
  const clauses: string[] = ['record_type = ?']
  const args: (string | number)[] = [recordType]
  if (filter?.startDate) { clauses.push(`${dateCol} >= ?`); args.push(filter.startDate) }
  if (filter?.endDate) { clauses.push(`${dateCol} <= ?`); args.push(filter.endDate) }
  if (filter?.agentNames && filter.agentNames.length > 0) {
    clauses.push(`${agentCol} IN (${filter.agentNames.map(() => '?').join(',')})`)
    args.push(...filter.agentNames)
  }
  return { clause: `WHERE ${clauses.join(' AND ')}`, args }
}

// ── qa_audits ─────────────────────────────────────────────────────────────────

export async function upsertQaAudit(input: {
  audit_date: string
  agent_name: string
  record_type: RecordType
  chat_email_score: number | null
  call_score: number | null
  chat_email_summary: string
  call_summary: string
  escalation_score: number | null
  escalation_summary: string
  remarks: string
}): Promise<string> {
  const db = await getDb()
  const uniqueId = generateUniqueId(input.audit_date, input.agent_name)
  await db.execute({
    sql: `INSERT INTO qa_audits
          (unique_id, record_type, audit_date, agent_name, chat_email_score, call_score, chat_email_summary, call_summary, escalation_score, escalation_summary, remarks)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(unique_id, record_type) DO UPDATE SET
            audit_date = excluded.audit_date,
            agent_name = excluded.agent_name,
            chat_email_score = excluded.chat_email_score,
            call_score = excluded.call_score,
            chat_email_summary = excluded.chat_email_summary,
            call_summary = excluded.call_summary,
            escalation_score = excluded.escalation_score,
            escalation_summary = excluded.escalation_summary,
            remarks = excluded.remarks,
            updated_at = datetime('now')`,
    args: [
      uniqueId, input.record_type, input.audit_date, input.agent_name,
      input.chat_email_score, input.call_score,
      input.chat_email_summary, input.call_summary,
      input.escalation_score, input.escalation_summary,
      input.remarks,
    ],
  })
  return uniqueId
}

export async function listQaAudits(filter: {
  startDate?: string
  endDate?: string
  agentNames?: string[]
  auditType?: AuditType
  recordType: RecordType
}): Promise<QaAudit[]> {
  const db = await getDb()
  const { clause, args } = buildDateAgentWhere('audit_date', 'agent_name', filter.recordType, filter)
  const { rows } = await db.execute({
    sql: `SELECT * FROM qa_audits ${clause} ORDER BY audit_date DESC, agent_name ASC`,
    args,
  })
  let audits = rows.map(r => toQaAudit(r as Record<string, unknown>))
  if (filter?.auditType === 'chat_email') {
    audits = audits.filter(a => a.chat_email_score != null || a.chat_email_summary)
  } else if (filter?.auditType === 'call') {
    audits = audits.filter(a => a.call_score != null || a.call_summary)
  }
  return audits
}

// ── agent_feedback ────────────────────────────────────────────────────────────

export async function upsertAgentFeedback(input: {
  feedback_date: string
  agent_name: string
  record_type: RecordType
  qa_feedback: string
  personal_improvement_plan: string
  qa_experience_rating: number | null
}): Promise<string> {
  const db = await getDb()
  const uniqueId = generateUniqueId(input.feedback_date, input.agent_name)
  await db.execute({
    sql: `INSERT INTO agent_feedback
          (unique_id, record_type, feedback_date, agent_name, qa_feedback, personal_improvement_plan, qa_experience_rating)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(unique_id, record_type) DO UPDATE SET
            feedback_date = excluded.feedback_date,
            agent_name = excluded.agent_name,
            qa_feedback = excluded.qa_feedback,
            personal_improvement_plan = excluded.personal_improvement_plan,
            qa_experience_rating = excluded.qa_experience_rating,
            updated_at = datetime('now')`,
    args: [
      uniqueId, input.record_type, input.feedback_date, input.agent_name,
      input.qa_feedback, input.personal_improvement_plan, input.qa_experience_rating,
    ],
  })
  return uniqueId
}

export async function listAgentFeedback(filter: {
  startDate?: string
  endDate?: string
  agentNames?: string[]
  recordType: RecordType
}): Promise<AgentFeedback[]> {
  const db = await getDb()
  const { clause, args } = buildDateAgentWhere('feedback_date', 'agent_name', filter.recordType, filter)
  const { rows } = await db.execute({
    sql: `SELECT * FROM agent_feedback ${clause} ORDER BY feedback_date DESC, agent_name ASC`,
    args,
  })
  return rows.map(r => toAgentFeedback(r as Record<string, unknown>))
}

// ── Overall report (Normal records merged by unique_id) ──────────────────────

export async function getOverallReport(filter?: {
  startDate?: string
  endDate?: string
  agentNames?: string[]
}): Promise<OverallReportRow[]> {
  const [audits, feedbacks] = await Promise.all([
    listQaAudits({ ...filter, recordType: 'normal' }),
    listAgentFeedback({ ...filter, recordType: 'normal' }),
  ])

  const rowsById = new Map<string, OverallReportRow>()

  for (const a of audits) {
    rowsById.set(a.unique_id, {
      unique_id: a.unique_id,
      date: a.audit_date,
      agent_name: a.agent_name,
      chat_email_score: a.chat_email_score,
      call_score: a.call_score,
      qa_experience_rating: null,
      has_qa: true,
      has_feedback: false,
    })
  }

  for (const f of feedbacks) {
    const existing = rowsById.get(f.unique_id)
    if (existing) {
      existing.qa_experience_rating = f.qa_experience_rating
      existing.has_feedback = true
    } else {
      rowsById.set(f.unique_id, {
        unique_id: f.unique_id,
        date: f.feedback_date,
        agent_name: f.agent_name,
        chat_email_score: null,
        call_score: null,
        qa_experience_rating: f.qa_experience_rating,
        has_qa: false,
        has_feedback: true,
      })
    }
  }

  return Array.from(rowsById.values()).sort((a, b) => b.date.localeCompare(a.date) || a.agent_name.localeCompare(b.agent_name))
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteQaAudit(uniqueId: string, recordType: RecordType): Promise<void> {
  const db = await getDb()
  await db.execute({
    sql: 'DELETE FROM qa_audits WHERE unique_id = ? AND record_type = ?',
    args: [uniqueId, recordType],
  })
}

export async function deleteAgentFeedback(uniqueId: string, recordType: RecordType): Promise<void> {
  const db = await getDb()
  await db.execute({
    sql: 'DELETE FROM agent_feedback WHERE unique_id = ? AND record_type = ?',
    args: [uniqueId, recordType],
  })
}

// ── Escalation report (Escalation records merged by unique_id) ───────────────

export async function getEscalationReport(filter?: {
  startDate?: string
  endDate?: string
  agentNames?: string[]
}): Promise<EscalationReportRow[]> {
  const [audits, feedbacks] = await Promise.all([
    listQaAudits({ ...filter, recordType: 'escalation' }),
    listAgentFeedback({ ...filter, recordType: 'escalation' }),
  ])

  const rowsById = new Map<string, EscalationReportRow>()

  for (const a of audits) {
    rowsById.set(a.unique_id, {
      unique_id: a.unique_id,
      date: a.audit_date,
      agent_name: a.agent_name,
      escalation_score: a.escalation_score,
      escalation_summary: a.escalation_summary,
      qa_feedback: '',
      personal_improvement_plan: '',
      qa_experience_rating: null,
      has_qa: true,
      has_feedback: false,
    })
  }

  for (const f of feedbacks) {
    const existing = rowsById.get(f.unique_id)
    if (existing) {
      existing.qa_feedback = f.qa_feedback
      existing.personal_improvement_plan = f.personal_improvement_plan
      existing.qa_experience_rating = f.qa_experience_rating
      existing.has_feedback = true
    } else {
      rowsById.set(f.unique_id, {
        unique_id: f.unique_id,
        date: f.feedback_date,
        agent_name: f.agent_name,
        escalation_score: null,
        escalation_summary: '',
        qa_feedback: f.qa_feedback,
        personal_improvement_plan: f.personal_improvement_plan,
        qa_experience_rating: f.qa_experience_rating,
        has_qa: false,
        has_feedback: true,
      })
    }
  }

  return Array.from(rowsById.values()).sort((a, b) => b.date.localeCompare(a.date) || a.agent_name.localeCompare(b.agent_name))
}
