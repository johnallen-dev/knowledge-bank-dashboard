import {
  listEligibleProcesses, getEdition, createEdition, deleteEdition,
  resetFeaturedInCycle, markHeadlineFeatured, markSupportingShown, getProcessesByIds,
  revertHeadlineIfMarkedToday, revertSupportingIfMarkedToday,
} from '@/lib/db/queries/processNewspaper'
import { generateTrivia } from '@/lib/ai/newspaperTrivia'
import { getTodayInNewspaperTimezone } from './timezone'
import type { NewspaperProcess, TodayEditionResponse } from './types'

// Headline + MAX_SUPPORTING = 6 total articles per edition (A4-page layout budget).
const MAX_SUPPORTING = 5

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

  const trivia = await generateTrivia(eligible)

  await createEdition({
    edition_date: todayStr,
    headline_process_id: headline.id,
    supporting_process_ids: supporting.map(p => p.id),
    trivia_text: trivia,
  })

  // Re-fetch the authoritative persisted edition in case a concurrent request won the
  // INSERT ... ON CONFLICT DO NOTHING race — every user must see the same edition.
  const persisted = await getEdition(todayStr)
  if (persisted && persisted.headline_process_id !== headline.id) {
    const headlineProc = (await getProcessesByIds([persisted.headline_process_id!]))[0] ?? null
    const supportingProcs = await getProcessesByIds(persisted.supporting_process_ids)
    return { date: todayStr, headline: headlineProc, supporting: supportingProcs, trivia: persisted.trivia_text }
  }

  return { date: todayStr, headline, supporting, trivia }
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
      return { date: todayStr, headline, supporting, trivia: existing.trivia_text }
    }
    // The stored headline no longer exists (deleted after this edition was generated),
    // or this row somehow has no headline at all. Either way it's a dead edition —
    // discard it and regenerate from current content instead of permanently showing
    // "no newspaper today" even after eligible processes exist again.
    await deleteEdition(todayStr)
  }

  const eligible = await listEligibleProcesses(todayStr)
  if (eligible.length === 0) {
    return { date: todayStr, headline: null, supporting: [], trivia: null }
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
    await deleteEdition(todayStr)
  }

  const eligible = await listEligibleProcesses(todayStr)
  if (eligible.length === 0) {
    return { date: todayStr, headline: null, supporting: [], trivia: null }
  }

  return buildTodayEdition(todayStr, eligible)
}
