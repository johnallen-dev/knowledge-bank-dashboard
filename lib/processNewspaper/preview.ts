/** Strips HTML tags and decodes common entities. Regex-based so it works identically server- and client-side. */
export function stripHtml(html: string): string {
  return html
    .replace(/<\/(p|div|li|h[1-6]|br)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export function buildPreview(html: string, maxChars = 200): string {
  const text = stripHtml(html)
  if (text.length <= maxChars) return text
  return `${text.slice(0, maxChars).trimEnd()}…`
}

/** First 1-2 sentences (or a char-capped fallback) of plain text, used for trivia fallback extraction. */
export function firstSentence(text: string, maxChars = 380): string {
  const stripped = stripHtml(text)
  const match = stripped.match(new RegExp(`^.{1,${maxChars}}?[.!?](?:\\s[A-Z].{0,${maxChars}}?[.!?])?(?:\\s|$)`))
  if (match) return match[0].trim()
  return stripped.length <= maxChars ? stripped : `${stripped.slice(0, maxChars).trimEnd()}…`
}

/**
 * Splits content into a short "dek" (subtitle-style first sentence, magazine-style) and
 * the remaining body text. Falls back to no dek if the first sentence doesn't fit a dek's
 * length, or if it's the only sentence in the content (nothing left for the body).
 */
export function extractDekAndBody(html: string, maxDekChars = 140): { dek: string | null; body: string } {
  const text = stripHtml(html)
  const match = text.match(/^.{10,}?[.!?](?:\s|$)/)
  if (!match || match[0].trim().length > maxDekChars) {
    return { dek: null, body: text }
  }
  const dek = match[0].trim()
  const rest = text.slice(match[0].length).trim()
  return rest ? { dek, body: rest } : { dek: null, body: dek }
}

/** Up to `max` list item texts found in rich-text HTML (bullet or numbered lists). */
export function extractListItems(html: string, max = 3): string[] {
  const items: string[] = []
  const re = /<li[^>]*>([\s\S]*?)<\/li>/gi
  let match: RegExpExecArray | null
  while (items.length < max && (match = re.exec(html))) {
    const text = stripHtml(match[1]).trim()
    if (text) items.push(text)
  }
  return items
}

/**
 * A short, content-grounded "takeaway" line for a sticky-note-style callout — prefers the
 * author's own Special Note, and otherwise falls back to the last sentence of the content
 * (often a closing tip/reminder), so it's never invented.
 */
export function extractTakeaway(process: { content_html: string; special_note: string | null }): string | null {
  if (process.special_note?.trim()) return stripHtml(process.special_note).trim()

  const text = stripHtml(process.content_html)
  const sentences = (text.match(/[^.!?]+[.!?]/g) ?? []).map(s => s.trim()).filter(Boolean)
  if (sentences.length === 0) return null

  // Prefer a short, punchy sentence (sticky-note length) if one exists — falling back to
  // the last sentence (often a closing tip) only when nothing concise is available, so a
  // single long run-on paragraph doesn't just re-print itself as the "takeaway."
  const concise = sentences.filter(s => s.length >= 12 && s.length <= 90)
  if (concise.length > 0) return concise[concise.length - 1]

  const last = sentences[sentences.length - 1]
  return last.length > 12 ? last : null
}
