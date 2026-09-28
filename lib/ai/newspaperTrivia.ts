import { getAnthropicClient } from './client'
import { stripHtml, firstSentence } from '@/lib/processNewspaper/preview'
import type { NewspaperProcess } from '@/lib/processNewspaper/types'

function buildPrompt(process: NewspaperProcess): string {
  const parts = [`Title: ${process.title}`, `Category: ${process.category}`, `Content: ${stripHtml(process.content_html)}`]
  if (process.special_note) parts.push(`Special Note: ${stripHtml(process.special_note)}`)
  const doc = parts.join('\n')

  return `Below is an internal company process document.

${doc}

Pick ONE interesting, useful fact or reminder that is EXPLICITLY stated in the text above — do not infer, combine, or invent anything not directly written there. Write it as 2-3 short sentences (roughly 300-420 characters total) suitable for a "Did you know?" trivia box for staff — enough to give real context, not just a one-line teaser.

Respond with ONLY the fact itself — no "Did you know" prefix, no quotation marks, no markdown, no extra commentary. If the document contains no fact interesting or specific enough to be worth highlighting, respond with exactly: NONE`
}

function fallbackTrivia(process: NewspaperProcess): string | null {
  const source = process.special_note?.trim() || process.content_html
  return firstSentence(source)
}

/** Generates the "Did You Know?" fact from a single process, chosen upstream by
 * rotation.ts so the same content can't repeat as trivia more than once a week — see
 * pickTriviaSource(). Scoping the prompt to one document (rather than letting Claude
 * choose among several) also avoids it converging on the same "best" fact every time. */
export async function generateTrivia(process: NewspaperProcess): Promise<string | null> {
  try {
    const response = await getAnthropicClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [{ role: 'user', content: buildPrompt(process) }],
    })
    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    if (text && text.toUpperCase() !== 'NONE') return text
  } catch (err) {
    console.error('[generateTrivia]', err)
  }

  return fallbackTrivia(process)
}
