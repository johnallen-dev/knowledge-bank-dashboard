import { NextRequest, NextResponse } from 'next/server'
import { getExamByToken } from '@/lib/db/queries/updates'
import type { ExamQuestion } from '@/lib/updates/types'

// Strip sensitive fields before sending to examinee
function sanitise(q: ExamQuestion) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { correct_answer, acceptable_variants, ...safe } = q
  return safe
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const exam = await getExamByToken(params.id)
    if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 })

    return NextResponse.json({
      examId: exam.id,
      shareToken: exam.share_token,
      questionCount: exam.question_count,
      questions: exam.questions.map(sanitise),
    })
  } catch (err) {
    console.error('[GET /api/updates/exams/:id]', err)
    return NextResponse.json({ error: 'Failed to load exam' }, { status: 500 })
  }
}
