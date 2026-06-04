export interface ParsedEntry {
  question: string
  answer: string
  tags: string[]
}

// ── CSV parser ────────────────────────────────────────────────────────────────

export function parseCsvText(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  if (lines.length < 2) return { headers: [], rows: [] }

  const headers = splitCsvLine(lines[0])
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const cells = splitCsvLine(line)
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => { row[h] = cells[idx] ?? '' })
    rows.push(row)
  }

  return { headers, rows }
}

function splitCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

export function csvRowsToEntries(
  rows: Record<string, string>[],
  questionCol: string,
  answerCol: string,
  tagsCol?: string
): ParsedEntry[] {
  return rows
    .filter(r => r[questionCol]?.trim() && r[answerCol]?.trim())
    .map(r => ({
      question: r[questionCol].trim(),
      answer: r[answerCol].trim(),
      tags: tagsCol && r[tagsCol]
        ? r[tagsCol].split(/[,;]/).map(t => t.trim()).filter(Boolean)
        : [],
    }))
}

// ── Plain Q&A text parser ─────────────────────────────────────────────────────

/**
 * Parses a free-form textarea with multiple Q&A pairs.
 * Supports four formats (auto-detected, can be mixed):
 *
 *  Format 1 — Q: / A: labels
 *    Q: What time is check-in?
 *    A: Check-in starts at 3:00 PM.
 *
 *  Format 2 — bold question
 *    **What time is check-in?**
 *    Check-in starts at 3:00 PM.
 *
 *  Format 3 — numbered
 *    1. What time is check-in?
 *    Check-in starts at 3:00 PM.
 *
 *  Format 4 — plain pairs separated by blank lines
 *    What time is check-in?
 *    Check-in starts at 3:00 PM.
 */
export function parseQAText(text: string): ParsedEntry[] {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
  if (!normalized) return []

  const entries: ParsedEntry[] = []

  // Format 1: Q: / A: labels (most reliable — try first)
  const qaPattern = /Q:\s*(.+?)[\n]+A:\s*([\s\S]+?)(?=\n\s*\nQ:|\n\s*\nq:|$)/gi
  let match: RegExpExecArray | null
  // eslint-disable-next-line no-cond-assign
  while ((match = qaPattern.exec(normalized)) !== null) {
    const question = match[1].trim()
    const answer = match[2].trim()
    if (question && answer) entries.push({ question, answer, tags: [] })
  }
  if (entries.length > 0) return entries

  // Format 2: **bold question** followed by answer paragraph
  const boldPattern = /\*\*(.+?)\*\*\s*\n([\s\S]+?)(?=\n\s*\n\*\*|$)/g
  while ((match = boldPattern.exec(normalized)) !== null) {
    const question = match[1].trim()
    const answer = match[2].trim()
    if (question && answer) entries.push({ question, answer, tags: [] })
  }
  if (entries.length > 0) return entries

  // Format 3: numbered items  "1. Question\nAnswer"
  const numberedPattern = /^\d+\.\s+(.+?)\n([\s\S]+?)(?=\n\d+\.|$)/gm
  while ((match = numberedPattern.exec(normalized)) !== null) {
    const question = match[1].trim()
    const answer = match[2].trim()
    if (question && answer) entries.push({ question, answer, tags: [] })
  }
  if (entries.length > 0) return entries

  // Format 4: blank-line separated pairs (first line = Q, rest = A)
  const blocks = normalized.split(/\n\s*\n/)
  for (const block of blocks) {
    const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length >= 2) {
      entries.push({ question: lines[0], answer: lines.slice(1).join('\n'), tags: [] })
    }
  }

  return entries
}

// ── Markdown parser ───────────────────────────────────────────────────────────

export function parseMarkdownText(text: string): ParsedEntry[] {
  const entries: ParsedEntry[] = []
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // Strategy 1: Split on H2 headings — each H2 is one entry
  const h2Blocks = normalized.split(/\n(?=## )/)
  if (h2Blocks.length > 1) {
    for (const block of h2Blocks) {
      const match = block.match(/^##\s+(.+)\n([\s\S]*)/)
      if (!match) continue
      const question = match[1].trim()
      const answer = cleanMarkdown(match[2].trim())
      if (question && answer) entries.push({ question, answer, tags: [] })
    }
    if (entries.length > 0) return entries
  }

  // Strategy 2: Split on H1 — entire file is one entry
  const h1Match = normalized.match(/^#\s+(.+)\n([\s\S]*)/)
  if (h1Match) {
    const question = h1Match[1].trim()
    const body = h1Match[2].trim()
    if (question && body) {
      return [{ question, answer: cleanMarkdown(body), tags: [] }]
    }
  }

  // Strategy 3: Bold lines as questions, following paragraph as answer
  const boldQA = Array.from(normalized.matchAll(/\*\*(.+?)\*\*\s*\n+([\s\S]+?)(?=\n\n|\*\*|$)/g))
  for (const m of boldQA) {
    const question = m[1].trim()
    const answer = cleanMarkdown(m[2].trim())
    if (question && answer.length > 10) entries.push({ question, answer, tags: [] })
  }
  if (entries.length > 0) return entries

  // Strategy 4: Entire file is one entry, use first sentence as question
  if (normalized.trim()) {
    const firstSentence = normalized.trim().split(/[.!?]\s/)[0]?.slice(0, 120)
    return [{
      question: firstSentence ? firstSentence + '?' : 'Imported entry',
      answer: cleanMarkdown(normalized.trim()),
      tags: [],
    }]
  }

  return entries
}

function cleanMarkdown(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '')   // remove images
    .replace(/\[(.+?)\]\(.*?\)/g, '$1') // keep link text
    .trim()
}
