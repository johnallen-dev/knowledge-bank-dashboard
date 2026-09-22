import type { NewspaperProcess } from './types'
import { stripHtml } from './preview'

const CATEGORY_FALLBACK_EMOJI: Record<NewspaperProcess['category'], string> = {
  internal: '🏢',
  guest_related: '🛎️',
  listing_related: '🏠',
}

// Order doesn't determine priority — the keyword that appears EARLIEST in the text wins
// (see findEarliestMatch), so a topic mentioned in passing late in the content can't
// out-rank the article's actual opening subject.
const KEYWORD_EMOJI: [RegExp, string][] = [
  [/\bbed ?bugs?\b|\bpest/i, '🐛'],
  [/\bsafety|\bsecurity|\bincident|\bemergency|\bpolice|\bdanger|\brisk\b/i, '🚨'],
  [/\brefund|\bpayment|\bpayout|\bcompensat/i, '💳'],
  [/\bbooking\.com|\bairbnb|\bvrbo|\blisting\b/i, '🏠'],
  [/\bdoor ?code|\block\b|\bkey\b|\bkeypad/i, '🔑'],
  [/\bcheck-?in|\barrival/i, '🧳'],
  [/\bcheck-?out|\bdeparture/i, '🚪'],
  [/\bcleaning\b|\bhousekeep/i, '🧹'],
  [/\bmaintenance|\brepair|\btool/i, '🛠️'],
  [/\bwifi|\binternet|\bnetwork/i, '📶'],
  [/\bparking|\bcar\b|\bvehicle/i, '🅿️'],
  [/\bpool|\bswim/i, '🏊'],
  [/\bbreakfast|\bfood|\bmeal|\bkitchen/i, '🍳'],
  [/\bguest request|\bcommunicat|\bmessage|\bchat|\bemail/i, '💬'],
  [/\bcall\b|\bphone/i, '📞'],
  [/\breview|\brating/i, '⭐'],
  [/\bcancel/i, '❌'],
  [/\bdate|\bcalendar|\bschedule/i, '📅'],
  [/\bnoise|\bcomplaint/i, '🔇'],
  [/\bpet\b|\bdog\b|\bcat\b/i, '🐾'],
  [/\bheating|\bac\b|\bair ?condition|\btemperature/i, '🌡️'],
  [/\btowel|\blinen|\blaundry/i, '🧺'],
  [/\btrash|\bgarbage|\bwaste/i, '🗑️'],
]

/** Returns the emoji whose keyword occurs earliest (leftmost) in the text, or null if none match. */
function findEarliestMatch(text: string): string | null {
  let bestIndex = Infinity
  let bestEmoji: string | null = null
  for (const [pattern, emoji] of KEYWORD_EMOJI) {
    const match = pattern.exec(text)
    if (match && match.index < bestIndex) {
      bestIndex = match.index
      bestEmoji = emoji
    }
  }
  return bestEmoji
}

export function getArticleEmoji(process: NewspaperProcess): string {
  const title = process.title
  const plainContent = stripHtml(process.content_html)

  return (
    findEarliestMatch(title) ??
    findEarliestMatch(plainContent) ??
    CATEGORY_FALLBACK_EMOJI[process.category] ??
    '📄'
  )
}
