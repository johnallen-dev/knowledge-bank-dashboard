import { NextRequest, NextResponse } from 'next/server'
import { runQAPipeline } from '@/lib/ai/pipeline'

export async function POST(req: NextRequest) {
  try {
    const { question, section } = await req.json()

    if (!question || typeof question !== 'string' || !question.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }
    if (section !== 'guest' && section !== 'user') {
      return NextResponse.json({ error: 'Section must be guest or user' }, { status: 400 })
    }

    const result = await runQAPipeline(question.trim(), section)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[/api/ask]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
