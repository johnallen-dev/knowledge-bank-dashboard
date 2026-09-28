import {
  listEligibleProcesses, getEdition, createEdition, deleteEdition,
  resetFeaturedInCycle, markHeadlineFeatured, markSupportingShown, getProcessesByIds,
  revertHeadlineIfMarkedToday, revertSupportingIfMarkedToday,
  markTriviaShown, revertTriviaIfMarkedToday,
  getMostRecentPastEditionLayout, setProcessSummary,
} from '@/lib/db/queries/processNewspaper'
import { generateTrivia } from '@/lib/ai/newspaperTrivia'
import { generateProcessSummary } from '@/lib/ai/processSummary'
import { getTodayInNewspaperTimezone } from './timezone'
import type { NewspaperProcess, TodayEditionResponse, LayoutKey } from './types'

// Headline + MAX_SUPPORTING = 6 total articles per edition (A4-page layout budget).
const MAX_SUPPORTING = 5

const LAYOUT_KEYS: LayoutKey[] = ['classic', 'modern', 'broadsheet', 'visual', 'compact']

// The same content can't be the "Did You Know?" trivia source more than once a week.
const TRIVIA_COOLDOWN_DAYS = 7

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Picks a layout different from the most recent past edition's, when there's a choice. */
async function pickLayout(todayStr: string): Promise<LayoutKey> {
  const previous = await getMostRecentPastEditionLayout(todayStr)
  const candidates = previous ? LAYOUT_KEYS.filter(k => k !== previous) : LAYOUT_KEYS
  return pickRandom(candidates)
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Picks which process today's "Did You Know?" fact should come from, excluding
 * anything used as trivia in the last TRIVIA_COOLDOWN_DAYS days. Falls back to the
 * least-recently-used process if the eligible library is too small to honor the
 * cooldown for every pick, so the feature keeps working rather than breaking. */
function pickTriviaSource(eligible: NewspaperProcess[], todayStr: string): NewspaperProcess {
  const cutoff = addDays(todayStr, -TRIVIA_COOLDOWN_DAYS)
  const cooled = eligible.filter(p => !p.last_trivia_at || p.last_trivia_at < cutoff)
  if (cooled.length > 0) return pickRandom(cooled)
  return [...eligible].sort((a, b) => (a.last_trivia_at ?? '').localeCompare(b.last_trivia_at ?? ''))[0]
}

/** Backfills a cached AI summary for any process that doesn't have one yet (older content). */
async function ensureSummaries(processes: NewspaperProcess[]): Promise<NewspaperProcess[]> {
  return Promise.all(processes.map(async p => {
    if (p.summary_text) return p
    const summary = await generateProcessSummary(p)
    await setProcessSummary(p.id, summary)
    return { ...p, summary_text: summary }
  }))
}

async function buildTodayEdition(todayStr: string, eligible: NewspaperProcess[]): Promise<TodayEditionResponse> {
  // Rule 2/3: headline candidates are eligible processes not yet featured this cycle.
  // If none remain, every currently-eligible process has been featured — start a new cycle.
  let headlineCandidates = eligible.filter(p => !p.featured_in_cycle)
  if (headlineCandidates.length === 0) {
    await resetFeaturedInCycle(eligible.map(p => p.id))
    headlineCandidates = eligible
  }

  const headline = pickRandom(headlineCandidates)
  await markHeadlineFeatured(headline.id, todayStr)

  // Rule 5: supporting articles prioritize least-recently-shown, randomized within ties.
  const supportingPool = eligible.filter(p => p.id !== headline.id)
  const sorted = shuffle(supportingPool).sort((a, b) => {
    const aKey = a.last_supporting_at ?? ''
    const bKey = b.last_supporting_at ?? ''
    return aKey.localeCompare(bKey)
  })
  const supporting = sorted.slice(0, MAX_SUPPORTING)
  await markSupportingShown(supporting.map(p => p.id), todayStr)

  const triviaSource = pickTriviaSource(eligible, todayStr)

  const [trivia, layoutKey, [headlineWithSummary, ...supportingWithSummary]] = await Promise.all([
    generateTrivia(triviaSource),
    pickLayout(todayStr),
    ensureSummaries([headline, ...supporting]),
  ])
  if (trivia) await markTriviaShown(triviaSource.id, todayStr)

  await createEdition({
    edition_date: todayStr,
    headline_process_id: headline.id,
    supporting_process_ids: supporting.map(p => p.id),
    trivia_text: trivia,
    trivia_process_id: trivia ? triviaSource.id : null,
    layout_key: layoutKey,
  })

  // Re-fetch the authoritative persisted edition in case a concurrent request won the
  // INSERT ... ON CONFLICT DO NOTHING race — every user must see the same edition.
  const persisted = await getEdition(todayStr)
  if (persisted && persisted.headline_process_id !== headline.id) {
    const headlineProc = (await getProcessesByIds([persisted.headline_process_id!]))[0] ?? null
    const supportingProcs = await getProcessesByIds(persisted.supporting_process_ids)
    return {
      date: todayStr, headline: headlineProc, supporting: supportingProcs,
      trivia: persisted.trivia_text, layoutKey: persisted.layout_key ?? 'classic',
    }
  }

  return { date: todayStr, headline: headlineWithSummary, supporting: supportingWithSummary, trivia, layoutKey }
}

export async function generateOrGetTodayEdition(): Promise<TodayEditionResponse> {
  const todayStr = getTodayInNewspaperTimezone()

  const existing = await getEdition(todayStr)
  if (existing) {
    const headline = existing.headline_process_id
      ? (await getProcessesByIds([existing.headline_process_id]))[0] ?? null
      : null
    if (headline) {
      const supporting = await getProcessesByIds(existing.supporting_process_ids)
      const [headlineWithSummary, ...supportingWithSummary] = await ensureSummaries([headline, ...supporting])
      return {
        date: todayStr, headline: headlineWithSummary, supporting: supportingWithSummary,
        trivia: existing.trivia_text, layoutKey: existing.layout_key ?? 'classic',
      }
    }
    // The stored headline no longer exists (deleted after this edition was generated),
    // or this row somehow has no headline at all. Either way it's a dead edition —
    // discard it and regenerate from current content instead of permanently showing
    // "no newspaper today" even after eligible processes exist again.
    await deleteEdition(todayStr)
  }

  const eligible = await listEligibleProcesses(todayStr)
  if (eligible.length === 0) {
    return { date: todayStr, headline: null, supporting: [], trivia: null, layoutKey: 'classic' }
  }

  return buildTodayEdition(todayStr, eligible)
}

/**
 * Forces a brand-new selection for today, discarding whatever edition is currently
 * live — used by the password-protected "Re-Create" button so a newly-added process
 * can become eligible for today's headline/supporting picks without waiting for the
 * next calendar day. The superseded headline/supporting marks are rolled back first
 * (only if still stamped with today's date) since that edition was never actually
 * published — it must not unfairly consume a Rule 2 rotation slot.
 */
export async function forceRegenerateTodayEdition(): Promise<TodayEditionResponse> {
  const todayStr = getTodayInNewspaperTimezone()

  const existing = await getEdition(todayStr)
  if (existing) {
    if (existing.headline_process_id) {
      await revertHeadlineIfMarkedToday(existing.headline_process_id, todayStr)
    }
    await revertSupportingIfMarkedToday(existing.supporting_process_ids, todayStr)
    await revertTriviaIfMarkedToday(existing.trivia_process_id, todayStr)
    await deleteEdition(todayStr)
  }

  const eligible = await listEligibleProcesses(todayStr)
  if (eligible.length === 0) {
    return { date: todayStr, headline: null, supporting: [], trivia: null, layoutKey: 'classic' }
  }

  return buildTodayEdition(todayStr, eligible)
}
