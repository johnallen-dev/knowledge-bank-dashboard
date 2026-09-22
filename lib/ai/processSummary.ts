import { getAnthropicClient } from './client'
import { stripHtml, buildPreview } from '@/lib/processNewspaper/preview'
import type { ProcessInput } from '@/lib/processNewspaper/types'

function buildPrompt(process: Pick<ProcessInput, 'title' | 'content_html' | 'special_note'>): string {
  const parts = [`Title: ${process.title}`, `Content: ${stripHtml(process.content_html)}`]
  if (process.special_note?.trim()) parts.push(`Special Note: ${stripHtml(process.special_note)}`)

  return `Below is one internal company process document.

${parts.join('\n')}

Write a summary of this process in approximately 50-60 words, for a staff-facing newsletter. Explain the process's main purpose and the most important information employees need to know.

Use ONLY information explicitly stated above — do not invent approval requirements, escalation steps, responsibilities, or any other operational detail not written there. Do not end mid-sentence.

Respond with ONLY the summary text — no title, no quotation marks, no markdown, no commentary.`
}

/** Deterministic fallback if the AI call fails — same no-fabrication guarantee, just less polished. */
function fallbackSummary(process: Pick<ProcessInput, 'title' | 'content_html'>): string {
  return buildPreview(process.content_html, 380)
}

export async function generateProcessSummary(process: Pick<ProcessInput, 'title' | 'content_html' | 'special_note'>): Promise<string> {
  try {
    const response = await getAnthropicClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [{ role: 'user', content: buildPrompt(process) }],
    })
    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    if (text) return text
  } catch (err) {
    console.error('[generateProcessSummary]', err)
  }
  return fallbackSummary(process)
}
