import { getAnthropicClient } from './client'
import { stripHtml, firstSentence } from '@/lib/processNewspaper/preview'
import type { NewspaperProcess } from '@/lib/processNewspaper/types'

function buildPrompt(processes: NewspaperProcess[]): string {
  const docs = processes.map(p => {
    const parts = [`Title: ${p.title}`, `Category: ${p.category}`, `Content: ${stripHtml(p.content_html)}`]
    if (p.special_note) parts.push(`Special Note: ${stripHtml(p.special_note)}`)
    return parts.join('\n')
  }).join('\n\n---\n\n')

  return `Below are internal company process documents.

${docs}

Pick ONE interesting, useful fact or reminder that is EXPLICITLY stated in the text above — do not infer, combine, or invent anything not directly written there. State it as a single, concise sentence (max ~220 characters) suitable for a "Did you know?" trivia box for staff.

Respond with ONLY the fact itself — no "Did you know" prefix, no quotation marks, no markdown, no extra commentary. If none of the documents contain a fact interesting or specific enough to be worth highlighting, respond with exactly: NONE`
}

function fallbackTrivia(processes: NewspaperProcess[]): string | null {
  const withNote = processes.filter(p => p.special_note?.trim())
  const pool = withNote.length > 0 ? withNote : processes
  if (pool.length === 0) return null
  const pick = pool[Math.floor(Math.random() * pool.length)]
  const source = pick.special_note?.trim() || pick.content_html
  return firstSentence(source)
}

export async function generateTrivia(processes: NewspaperProcess[]): Promise<string | null> {
  if (processes.length === 0) return null

  try {
    const response = await getAnthropicClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [{ role: 'user', content: buildPrompt(processes) }],
    })
    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    if (text && text.toUpperCase() !== 'NONE') return text
  } catch (err) {
    console.error('[generateTrivia]', err)
  }

  return fallbackTrivia(processes)
}
