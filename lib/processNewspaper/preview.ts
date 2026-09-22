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
