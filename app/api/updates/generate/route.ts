import { NextRequest, NextResponse } from 'next/server'
import { getAnthropicClient } from '@/lib/ai/client'
import { buildExamPrompt } from '@/lib/updates/examPrompt'
import { getDocument, createExam, getExamById, updateDocumentTitle } from '@/lib/db/queries/updates'
import type { ExamQuestion } from '@/lib/updates/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const documentId = Number(body.documentId)
    const questionCount = Number(body.questionCount) as 10 | 20
    const updateName = String(body.updateName ?? '').trim()

    if (!documentId || ![10, 20].includes(questionCount)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const doc = await getDocument(documentId)
    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

    const prompt = buildExamPrompt(doc.extracted_text, questionCount)

    const response = await getAnthropicClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    // Strip any markdown fences Claude may have added
    const cleaned = text.replace(/^```[a-z]*\n?/gm, '').replace(/^```$/gm, '').trim()
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[generate] Raw Claude response:', text)
      throw new Error('Claude did not return valid JSON')
    }

    const parsed = JSON.parse(jsonMatch[0]) as { questions: ExamQuestion[] }
    const questions = parsed.questions

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('No questions returned from Claude')
    }

    // Save the custom update name as the document title
    if (updateName) {
      await updateDocumentTitle(documentId, updateName)
    }

    const examId = await createExam({
      document_id: documentId,
      question_count: questionCount,
      questions_json: JSON.stringify(questions),
    })

    const exam = await getExamById(examId)

    return NextResponse.json({ examId, shareToken: exam?.share_token ?? '' })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[POST /api/updates/generate]', message)
    return NextResponse.json({ error: `Exam generation failed: ${message}` }, { status: 500 })
  }
}
