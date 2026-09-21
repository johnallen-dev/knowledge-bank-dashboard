const NEWSPAPER_TIMEZONE = 'Asia/Manila'

/** Returns today's date as YYYY-MM-DD in the newspaper's configured timezone. */
export function getTodayInNewspaperTimezone(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: NEWSPAPER_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}
