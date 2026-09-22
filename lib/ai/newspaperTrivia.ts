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

Pick ONE interesting, useful fact or reminder that is EXPLICITLY stated in the text above — do not infer, combine, or invent anything not directly written there. Write it as 2-3 short sentences (roughly 300-420 characters total) suitable for a "Did you know?" trivia box for staff — enough to give real context, not just a one-line teaser.

Respond with ONLY the fact itself — no "Did you know" prefix, no quotation marks, no markdown, no extra commentary. If none of the documents contain a fact interesting or specific enough to be worth highlighting, respond with exactly: NONE`
}

function pickRandomSubset<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, n)
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

  // The eligible pool is the same on every Re-Create within a day, and asked to pick
  // "the one most interesting fact" from a fixed set, Claude converges on the same
  // answer every time — just reworded. Randomizing which processes it even sees makes
  // each regeneration draw from genuinely different source content.
  const pool = pickRandomSubset(processes, Math.min(3, processes.length))

  try {
    const response = await getAnthropicClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [{ role: 'user', content: buildPrompt(pool) }],
    })
    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    if (text && text.toUpperCase() !== 'NONE') return text
  } catch (err) {
    console.error('[generateTrivia]', err)
  }

  return fallbackTrivia(pool)
}
