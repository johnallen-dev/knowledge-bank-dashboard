import { NextRequest, NextResponse } from 'next/server'
import { getAnthropicClient } from '@/lib/ai/client'

export const dynamic = 'force-dynamic'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json()

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    const response = await getAnthropicClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: `You are Claude, an AI assistant made by Anthropic. You are helpful, harmless, and honest. Answer questions clearly and thoroughly. You are being accessed through the Greenkey Knowledge Hub.`,
      messages,
    })

    const reply = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ reply })
  } catch (err) {
    console.error('[POST /api/claude/chat]', err)
    return NextResponse.json({ error: 'Failed to get response from Claude' }, { status: 500 })
  }
}
