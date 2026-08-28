import { getAnthropicClient } from './client'
import type { QaAudit } from '@/lib/qaReport/types'
import type { AiAnalysisResult, AiAnalysisSection } from '@/lib/qaReport/types'

const EMPTY_SECTION: AiAnalysisSection = {
  strengths: [],
  weaknesses: [],
  recurringPatterns: [],
  coachingOpportunities: [],
}

function buildPrompt(audits: QaAudit[]): string {
  const agentNames = Array.from(new Set(audits.map(a => a.agent_name)))
  const rows = audits.map(a => `
Date: ${a.audit_date}
Agent: ${a.agent_name}
Chat/Email Score: ${a.chat_email_score ?? 'N/A'}
Chat/Email Summary: ${a.chat_email_summary || 'N/A'}
Call Score: ${a.call_score ?? 'N/A'}
Call Summary: ${a.call_summary || 'N/A'}
Remarks: ${a.remarks || 'N/A'}`.trim()).join('\n\n---\n\n')

  return `You are a QA coaching analyst reviewing audit data for ${agentNames.length === 1 ? `agent "${agentNames[0]}"` : `${agentNames.length} agents (${agentNames.join(', ')})`}.

Analyze the following QA audit records. Each record has separate Chat/Email and Call audit data.

${rows}

Based ONLY on this data, identify:
- Strengths: what is going well, based on scores and positive/recurring themes in the summaries.
- Weaknesses: low scores, recurring mistakes, negative feedback, common issues in summaries.
- Recurring patterns: issues or trends repeated across multiple audits.
- Coaching opportunities: where additional coaching, training, or monitoring would help.

Produce the analysis separately for Chat/Email audits, for Call audits, and an overall combined view.

Respond with a JSON object ONLY (no markdown fences, no extra text), in exactly this shape:
{
  "chatEmail": { "strengths": string[], "weaknesses": string[], "recurringPatterns": string[], "coachingOpportunities": string[] },
  "call": { "strengths": string[], "weaknesses": string[], "recurringPatterns": string[], "coachingOpportunities": string[] },
  "overall": { "strengths": string[], "weaknesses": string[], "recurringPatterns": string[], "coachingOpportunities": string[] }
}

If there is not enough data for a section, return an empty array for it. Keep each bullet concise (one sentence).`
}

export async function generateQaAnalysis(audits: QaAudit[]): Promise<AiAnalysisResult> {
  if (audits.length === 0) {
    return { chatEmail: EMPTY_SECTION, call: EMPTY_SECTION, overall: EMPTY_SECTION }
  }

  const prompt = buildPrompt(audits)
  const response = await getAnthropicClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI response did not contain JSON')

  const parsed = JSON.parse(jsonMatch[0])
  return {
    chatEmail: { ...EMPTY_SECTION, ...parsed.chatEmail },
    call: { ...EMPTY_SECTION, ...parsed.call },
    overall: { ...EMPTY_SECTION, ...parsed.overall },
  }
}
