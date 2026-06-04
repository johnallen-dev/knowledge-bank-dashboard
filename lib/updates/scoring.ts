import type { ExamQuestion } from './types'

export interface ScoreBreakdown {
  questionId: string
  correct: boolean
  given: string
  expected: string
}

export interface ScoreResult {
  score: number
  max: number
  breakdown: ScoreBreakdown[]
}

export function scoreAttempt(
  questions: ExamQuestion[],
  answers: Record<string, string>
): ScoreResult {
  let score = 0
  const breakdown: ScoreBreakdown[] = []

  for (const q of questions) {
    const given = (answers[q.id] ?? '').trim()
    let correct = false

    const isFill = q.type === 'fill_blank' || q.type.includes('fill')
    if (!isFill) {
      correct = given.toLowerCase() === q.correct_answer.toLowerCase()
    } else {
      // fill_blank — check primary answer and all variants
      const normalised = given.toLowerCase()
      const candidates = [
        q.correct_answer.toLowerCase(),
        ...(q.acceptable_variants ?? []).map(v => v.toLowerCase()),
      ]
      correct = candidates.some(c => c === normalised)
    }

    if (correct) score += q.points
    breakdown.push({ questionId: q.id, correct, given, expected: q.correct_answer })
  }

  return { score, max: questions.reduce((s, q) => s + q.points, 0), breakdown }
}
