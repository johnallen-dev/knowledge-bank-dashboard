import {
  Bug, ShieldAlert, CreditCard, Home, KeyRound, Luggage, DoorOpen, Sparkles, Wrench,
  Wifi, ParkingCircle, Waves, UtensilsCrossed, MessageCircle, Phone, Star, XCircle,
  CalendarDays, VolumeX, PawPrint, Thermometer, Shirt, Trash2, Building2, ConciergeBell,
} from 'lucide-react'
import { stripHtml } from './preview'
import { CATEGORY_COLOR, CATEGORY_TINT } from './categoryStyle'
import type { NewspaperProcess } from './types'

type IconComponent = typeof Bug

const CATEGORY_FALLBACK_ICON: Record<NewspaperProcess['category'], IconComponent> = {
  internal: Building2,
  guest_related: ConciergeBell,
  listing_related: Home,
}

// Order doesn't determine priority — the keyword that appears EARLIEST in the text wins
// (see findEarliestMatch), so a topic mentioned in passing late in the content can't
// out-rank the article's actual opening subject.
const KEYWORD_ICON: [RegExp, IconComponent][] = [
  [/\bbed ?bugs?\b|\bpest/i, Bug],
  [/\bsafety|\bsecurity|\bincident|\bemergency|\bpolice|\bdanger|\brisk\b/i, ShieldAlert],
  [/\brefund|\bpayment|\bpayout|\bcompensat/i, CreditCard],
  [/\bbooking\.com|\bairbnb|\bvrbo|\blisting\b/i, Home],
  [/\bdoor ?code|\block\b|\bkey\b|\bkeypad/i, KeyRound],
  [/\bcheck-?in|\barrival/i, Luggage],
  [/\bcheck-?out|\bdeparture/i, DoorOpen],
  [/\bcleaning\b|\bhousekeep/i, Sparkles],
  [/\bmaintenance|\brepair|\btool/i, Wrench],
  [/\bwifi|\binternet|\bnetwork/i, Wifi],
  [/\bparking|\bcar\b|\bvehicle/i, ParkingCircle],
  [/\bpool|\bswim/i, Waves],
  [/\bbreakfast|\bfood|\bmeal|\bkitchen/i, UtensilsCrossed],
  [/\bguest request|\bcommunicat|\bmessage|\bchat|\bemail/i, MessageCircle],
  [/\bcall\b|\bphone/i, Phone],
  [/\breview|\brating/i, Star],
  [/\bcancel/i, XCircle],
  [/\bdate|\bcalendar|\bschedule/i, CalendarDays],
  [/\bnoise|\bcomplaint/i, VolumeX],
  [/\bpet\b|\bdog\b|\bcat\b/i, PawPrint],
  [/\bheating|\bac\b|\bair ?condition|\btemperature/i, Thermometer],
  [/\btowel|\blinen|\blaundry/i, Shirt],
  [/\btrash|\bgarbage|\bwaste/i, Trash2],
]

function findEarliestMatch(text: string): IconComponent | null {
  let bestIndex = Infinity
  let bestIcon: IconComponent | null = null
  for (const [pattern, icon] of KEYWORD_ICON) {
    const match = pattern.exec(text)
    if (match && match.index < bestIndex) {
      bestIndex = match.index
      bestIcon = icon
    }
  }
  return bestIcon
}

export function getArticleIcon(process: NewspaperProcess): IconComponent {
  const plainContent = stripHtml(process.content_html)
  return (
    findEarliestMatch(process.title) ??
    findEarliestMatch(plainContent) ??
    CATEGORY_FALLBACK_ICON[process.category]
  )
}

interface ArticleIconProps {
  process: NewspaperProcess
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_MAP = {
  sm: { box: 32, icon: 16 },
  md: { box: 44, icon: 22 },
  lg: { box: 64, icon: 32 },
}

/** A category-tinted circular "illustration" badge — the app's substitute for topical photography. */
export function ArticleIcon({ process, size = 'md' }: ArticleIconProps) {
  const Icon = getArticleIcon(process)
  const { box, icon } = SIZE_MAP[size]
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0"
      style={{ width: box, height: box, background: CATEGORY_TINT[process.category] }}
    >
      <Icon style={{ width: icon, height: icon, color: CATEGORY_COLOR[process.category] }} />
    </div>
  )
}
