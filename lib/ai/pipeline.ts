import { getAnthropicClient } from './client'
import { buildGuestPrompt, buildUserPrompt } from './prompts'
import { bm25ToConfidence, blendConfidence, type MatchType } from './confidence'
import { exactMatch, ftsSearch, ftsSearchOr, type KnowledgeEntry } from '@/lib/db/queries/knowledge'
import { searchNotion } from '@/lib/notion/search'
import { logQuestion } from '@/lib/db/queries/questions'

export interface Source {
  type: 'knowledge_bank' | 'notion'
  id?: number | string
  title: string
  url?: string
}

export interface PipelineResult {
  answer: string
  confidence: number
  matchType: MatchType
  sources: Source[]
  relatedEntries: KnowledgeEntry[]
}

// Words that carry no search meaning
const STOPWORDS = new Set([
  'a','an','the','is','are','was','were','be','been','being',
  'have','has','had','do','does','did','will','would','could','should',
  'may','might','shall','can','need','dare','ought','used',
  'i','you','we','they','he','she','it','me','us','them','him','her',
  'my','your','our','their','its','this','that','these','those',
  'what','when','where','who','whom','which','how','why',
  'in','on','at','to','for','of','with','by','from','up','about',
  'into','through','during','before','after','above','below',
  'between','out','off','over','under','again','further','then',
  'once','and','but','or','nor','so','yet','both','either','neither',
  'not','no','if','because','as','until','while','although','though',
])

/** Semantic synonyms for common hotel question vocabulary */
const SYNONYMS: Record<string, string[]> = {
  located:    ['address', 'location', 'find', 'situated'],
  location:   ['address', 'located', 'where', 'find'],
  address:    ['location', 'located', 'where', 'find'],
  find:       ['address', 'location', 'located'],
  cost:       ['price', 'rate', 'fee', 'charge'],
  price:      ['cost', 'rate', 'fee', 'charge'],
  fee:        ['cost', 'price', 'rate', 'charge'],
  charge:     ['cost', 'price', 'rate', 'fee'],
  rate:       ['cost', 'price', 'fee', 'charge'],
  hours:      ['schedule', 'time', 'open', 'opening'],
  open:       ['hours', 'schedule', 'time', 'opening'],
  schedule:   ['hours', 'time', 'open', 'opening'],
  breakfast:  ['meal', 'dining', 'food', 'included'],
  dining:     ['breakfast', 'meal', 'food', 'restaurant'],
  restaurant: ['dining', 'food', 'meal'],
  parking:    ['park', 'car', 'vehicle', 'garage'],
  park:       ['parking', 'car', 'vehicle'],
  wifi:       ['internet', 'network', 'wireless', 'connection'],
  internet:   ['wifi', 'network', 'wireless', 'connection'],
  network:    ['wifi', 'internet', 'wireless'],
  checkin:    ['arrival', 'arrive', 'arriving', 'check'],
  checkout:   ['departure', 'leave', 'leaving', 'depart'],
  arrival:    ['checkin', 'arrive', 'arriving'],
  departure:  ['checkout', 'leave', 'leaving'],
  transfer:   ['transport', 'shuttle', 'taxi', 'pickup'],
  transport:  ['transfer', 'shuttle', 'taxi'],
  shuttle:    ['transfer', 'transport', 'taxi'],
  pool:       ['swimming', 'swim'],
  swimming:   ['pool', 'swim'],
  gym:        ['fitness', 'exercise', 'sport'],
  fitness:    ['gym', 'exercise', 'sport'],
  near:       ['nearby', 'close', 'around'],
  nearby:     ['near', 'close', 'around'],
}

/** Expand keywords with their semantic synonyms */
function expandWithSynonyms(keywords: string[]): string[] {
  const expanded = new Set(keywords)
  for (const kw of keywords) {
    for (const syn of SYNONYMS[kw] ?? []) expanded.add(syn)
  }
  return Array.from(expanded)
}

/** Extract meaningful keywords from a natural-language question */
function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[?!.,;:"'()\[\]{}\/\\]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 2 && !STOPWORDS.has(w))
    .slice(0, 8)
}

/** Deduplicate entries by id, keeping the first occurrence */
function dedupeById(entries: KnowledgeEntry[]): KnowledgeEntry[] {
  const seen = new Set<number>()
  return entries.filter(e => { if (seen.has(e.id)) return false; seen.add(e.id); return true })
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

const GUEST_OPENERS = [
  'Of course! Happy to help with that.',
  'Great question — glad you asked!',
  'Absolutely, we want to make sure you have everything you need!',
  'We appreciate you reaching out!',
  'We\'re so glad you asked!',
  'Thanks for checking with us!',
]

const GUEST_CLOSERS = [
  'Is there anything else we can help you with?',
  'We hope that helps, and feel free to ask us anything else!',
  'Don\'t hesitate to reach out if there\'s anything else on your mind!',
  'We\'re always here if you need anything else during your stay!',
  'It\'s our pleasure to help — just let us know if you need anything more!',
  'We hope this makes your stay even more enjoyable. Just ask if there\'s anything else!',
]

const GUEST_NO_ANSWER = [
  'We truly appreciate your question and want to make sure you get the right answer! Our team would be happy to assist you directly — please feel free to ask us in person or give us a call.',
  'That\'s a great question, and we want to give you the most accurate answer possible. Please reach out to our team directly and we\'ll be glad to help right away!',
  'We want to make sure we give you exactly the right information on this one. Our team is just a message or call away — we\'d love to help you personally!',
  'Thank you for reaching out! We\'d love to point you in the right direction. Please connect with our team directly and they\'ll take great care of you!',
]

export async function runQAPipeline(
  question: string,
  section: 'guest' | 'user'
): Promise<PipelineResult> {
  const startMs = performance.now()
  const sources: Source[] = []
  const contextParts: string[] = []
  let matchType: MatchType = 'none'
  let matchScore = 0.10
  let matchedEntryId: number | null = null
  let relatedEntries: KnowledgeEntry[] = []

  // ── Step 1: Exact match (same wording, case-insensitive)
  const exact = await exactMatch(question)
  if (exact) {
    matchType = 'exact'
    matchScore = 1.0
    matchedEntryId = exact.id
    contextParts.push(`[KB #${exact.id}] Q: ${exact.question}\nA: ${exact.answer}`)
    sources.push({ type: 'knowledge_bank', id: exact.id, title: exact.question })
  }

  // ── Step 2a: FTS5 AND search with the full question text
  const ftsResults = await ftsSearch(question, 5)

  // ── Step 2b: Keyword fallback — fires when full-question AND search finds nothing.
  //    Uses synonym expansion + OR search to bridge semantic gaps (e.g. "located" vs "address").
  let keywordResults: KnowledgeEntry[] = []
  if (ftsResults.length === 0 && matchType !== 'exact') {
    const keywords = extractKeywords(question)
    const expanded = expandWithSynonyms(keywords)

    // First: try OR search across all expanded keywords (catches semantic synonyms)
    keywordResults = await ftsSearchOr(expanded, 5)

    // Still nothing — try AND pairs of the original keywords
    if (keywordResults.length === 0) {
      for (let i = 0; i < keywords.length - 1 && keywordResults.length === 0; i++) {
        keywordResults = await ftsSearch(`${keywords[i]} ${keywords[i + 1]}`, 5)
      }
    }

    // Still nothing — try single keywords (original + synonyms), filter weak matches
    if (keywordResults.length === 0) {
      for (const kw of expanded) {
        const r = await ftsSearch(kw, 3)
        const strong = r.filter(e => e.rank == null || bm25ToConfidence(e.rank) >= 0.45)
        keywordResults.push(...strong)
        if (keywordResults.length >= 5) break
      }
      keywordResults = dedupeById(keywordResults).slice(0, 5)
    }
  }

  // ── Step 2c: If AND search found results but they may be off-topic, also run
  //    an OR synonym search and blend — gives Claude more context to work with.
  if (ftsResults.length > 0 && ftsResults[0].rank != null && bm25ToConfidence(ftsResults[0].rank) < 0.6) {
    const keywords = extractKeywords(question)
    const expanded = expandWithSynonyms(keywords)
    const orResults = await ftsSearchOr(expanded, 5)
    keywordResults = dedupeById([...ftsResults, ...orResults]).slice(0, 5)
  }

  const allFtsResults = dedupeById([...ftsResults, ...keywordResults])

  if (allFtsResults.length > 0) {
    const top = allFtsResults[0]
    // Keyword-only results get a slightly lower base confidence than a full-phrase match
    const topConf = top.rank != null ? bm25ToConfidence(top.rank) : (ftsResults.length === 0 ? 0.55 : 0.6)
    if (matchType !== 'exact' && topConf > matchScore) {
      matchType = 'fts'
      matchScore = topConf
      matchedEntryId = top.id
    }
    for (const r of allFtsResults.slice(0, 5)) {
      if (!contextParts.find(c => c.includes(`[KB #${r.id}]`))) {
        contextParts.push(`[KB #${r.id}] Q: ${r.question}\nA: ${r.answer}`)
      }
      if (!sources.find(s => s.id === r.id)) {
        sources.push({ type: 'knowledge_bank', id: r.id, title: r.question })
      }
    }
    relatedEntries = allFtsResults.slice(0, 5)
  }

  // ── Step 3: Notion search when KB confidence is still low
  if (matchScore < 0.80) {
    try {
      const notionResults = await searchNotion(question)
      if (notionResults.length > 0) {
        if (matchType === 'none') { matchType = 'notion'; matchScore = 0.60 }
        for (const nr of notionResults.slice(0, 3)) {
          contextParts.push(`[Notion: ${nr.title}]\n${nr.snippet}`)
          sources.push({ type: 'notion', id: nr.pageId, title: nr.title, url: nr.url })
        }
      }
    } catch {
      // Notion unavailable, continue without it
    }
  }

  // ── Step 4: Call Claude with all collected context
  const context = contextParts.join('\n\n---\n\n')
  const prompt = section === 'guest'
    ? buildGuestPrompt(context, question)
    : buildUserPrompt(context, question)

  if (matchType === 'none') matchType = 'ai'

  // KB answer used as fallback if Claude is unavailable
  const kbFallbackAnswer = exact?.answer ?? allFtsResults[0]?.answer ?? null

  let answer = ''
  let claudeScore: number | null = null

  try {
    const response = await getAnthropicClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      answer = parsed.answer ?? ''
      claudeScore = typeof parsed.confidence === 'number' ? parsed.confidence : null
    } else {
      answer = text
    }
  } catch {
    if (section === 'guest') {
      // Only use the raw KB answer as a fallback when confidence is high enough to
      // be sure it is actually relevant — otherwise send the "ask the team" message.
      answer = (kbFallbackAnswer && matchScore >= 0.70)
        ? `${pickRandom(GUEST_OPENERS)} ${kbFallbackAnswer} ${pickRandom(GUEST_CLOSERS)}`
        : pickRandom(GUEST_NO_ANSWER)
    } else {
      answer = (kbFallbackAnswer && matchScore >= 0.55)
        ? kbFallbackAnswer
        : 'No answer could be found right now. Please check the knowledge base directly.'
    }
  }

  const finalConfidence = blendConfidence(matchScore, claudeScore)
  const responseMs = Math.round(performance.now() - startMs)

  await logQuestion({
    question_text: question,
    section,
    matched_entry_id: matchedEntryId,
    match_type: matchType,
    confidence: finalConfidence,
    answer_given: answer,
    sources_used: sources,
    response_ms: responseMs,
  })

  return { answer, confidence: finalConfidence, matchType, sources, relatedEntries }
}
