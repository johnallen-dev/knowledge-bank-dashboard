export type AuditType = 'all' | 'chat_email' | 'call'

/** Which report a record belongs to — distinct from AuditType (the chat/call channel filter). */
export type RecordType = 'normal' | 'escalation'

export interface QaAudit {
  unique_id: string
  record_type: RecordType
  audit_date: string
  agent_name: string
  chat_email_score: number | null
  call_score: number | null
  chat_email_summary: string
  call_summary: string
  escalation_score: number | null
  escalation_summary: string
  remarks: string
  created_at: string
  updated_at: string
}

export interface AgentFeedback {
  unique_id: string
  record_type: RecordType
  feedback_date: string
  agent_name: string
  qa_feedback: string
  personal_improvement_plan: string
  qa_experience_rating: number | null
  created_at: string
  updated_at: string
}

export interface EscalationReportRow {
  unique_id: string
  date: string
  agent_name: string
  escalation_score: number | null
  escalation_summary: string
  qa_feedback: string
  personal_improvement_plan: string
  qa_experience_rating: number | null
  has_qa: boolean
  has_feedback: boolean
}

export interface OverallReportRow {
  unique_id: string
  date: string
  agent_name: string
  chat_email_score: number | null
  call_score: number | null
  qa_experience_rating: number | null
  has_qa: boolean
  has_feedback: boolean
}

export interface AiAnalysisSection {
  strengths: string[]
  weaknesses: string[]
  recurringPatterns: string[]
  coachingOpportunities: string[]
}

export interface AiAnalysisResult {
  chatEmail: AiAnalysisSection
  call: AiAnalysisSection
  overall: AiAnalysisSection
}

export interface QaReportFilterParams {
  startDate?: string
  endDate?: string
  agentNames?: string[]
  auditType?: AuditType
}
