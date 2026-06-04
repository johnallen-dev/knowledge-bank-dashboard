import { NextRequest, NextResponse } from 'next/server'
import { getExamByToken, createAttempt } from '@/lib/db/queries/updates'
import { scoreAttempt } from '@/lib/updates/scoring'

export async function POST(req: NextRequest) {
  try {
    const {
      token,
      examineeName,
      examDate,
      answers,
      signatureB64,
    } = await req.json() as {
      token: string
      examineeName: string
      examDate: string
      answers: Record<string, string>
      signatureB64: string
    }

    if (!token || !examineeName?.trim() || !examDate || !answers || !signatureB64) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const exam = await getExamByToken(token)
    if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 })

    const { score, max, breakdown } = scoreAttempt(exam.questions, answers)

    const attemptId = await createAttempt({
      exam_id: exam.id,
      examinee_name: examineeName.trim(),
      exam_date: examDate,
      answers_json: JSON.stringify(answers),
      score,
      max_score: max,
      signature_b64: signatureB64,
    })

    return NextResponse.json({ attemptId, score, maxScore: max, breakdown })
  } catch (err) {
    console.error('[POST /api/updates/attempts]', err)
    return NextResponse.json({ error: 'Submission failed. Please try again.' }, { status: 500 })
  }
}
