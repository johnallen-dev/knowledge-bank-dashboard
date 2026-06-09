import { NextRequest, NextResponse } from 'next/server'
import { getExamByToken, deleteExam } from '@/lib/db/queries/updates'
import type { ExamQuestion } from '@/lib/updates/types'

export const dynamic = 'force-dynamic'

const ADMIN_PASSWORD = '00000'

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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (req.headers.get('authorization') !== `Bearer ${ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await deleteExam(Number(params.id))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/updates/exams/:id]', err)
    return NextResponse.json({ error: 'Failed to delete exam' }, { status: 500 })
  }
}
