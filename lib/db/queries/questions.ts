import { getDb } from '../client'

export async function logQuestion(input: {
  question_text: string
  section: 'guest' | 'user'
  matched_entry_id?: number | null
  match_type?: string
  confidence?: number
  answer_given?: string
  sources_used?: object[]
  response_ms?: number
}): Promise<void> {
  try {
    const db = await getDb()
    await db.execute({
      sql: `INSERT INTO question_log (question_text, section, matched_entry_id, match_type, confidence, answer_given, sources_used, response_ms) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        input.question_text,
        input.section,
        input.matched_entry_id ?? null,
        input.match_type ?? null,
        input.confidence ?? null,
        input.answer_given ?? null,
        JSON.stringify(input.sources_used ?? []),
        input.response_ms ?? null,
      ],
    })
  } catch {
    // Never let logging failures crash a Q&A request
  }
}
