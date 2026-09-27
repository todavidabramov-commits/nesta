export const VIEWING_SLOT_HOURS = ['10:00', '11:30', '14:00', '18:00'] as const

export type ViewingSlot = (typeof VIEWING_SLOT_HOURS)[number]

export function todayISO(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Monday-start week containing `date`. */
export function weekDays(anchor: Date): Date[] {
  const day = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate())
  const weekday = (day.getDay() + 6) % 7 // Mon=0 … Sun=6
  const monday = new Date(day)
  monday.setDate(day.getDate() - weekday)
  return Array.from({ length: 7 }, (_, i) => {
    const next = new Date(monday)
    next.setDate(monday.getDate() + i)
    return next
  })
}

export function shiftWeek(anchor: Date, deltaWeeks: number): Date {
  const next = new Date(anchor)
  next.setDate(anchor.getDate() + deltaWeeks * 7)
  return next
}

export function formatMonthYear(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatSlotLabel(time: string, locale: string): string {
  const [h, m] = time.split(':').map(Number)
  const hhmm = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  if (locale === 'ru') return hhmm
  // Figma uses 24h clock + AM/PM suffix (e.g. "14:00 PM")
  return `${hhmm} ${h < 12 ? 'AM' : 'PM'}`
}

export function formatConfirmWhen(isoDate: string, time: string, locale: string): string {
  const date = parseISODate(isoDate)
  if (locale === 'ru') {
    const datePart = new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
    }).format(date)
    return `${datePart} · ${formatSlotLabel(time, locale)}`
  }
  const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date).toUpperCase()
  const day = date.getDate()
  return `${month} ${day} • ${time}`
}

export function formatSlotsHeading(isoDate: string, locale: string): string {
  const date = parseISODate(isoDate)
  if (locale === 'ru') {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
    }).format(date)
  }
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date)
  return `${month} ${date.getDate()}`
}

export function propertyAddressLabel(address: string, neighborhood: string, city = 'Amsterdam'): string {
  if (address.trim()) return address.trim()
  if (neighborhood.trim()) return `${neighborhood.trim()}, ${city}`
  return city
}

export function googleCalendarUrl(input: {
  title: string
  address: string
  isoDate: string
  time: string
  details?: string
}): string {
  const [hh, mm] = input.time.split(':').map(Number)
  const start = parseISODate(input.isoDate)
  start.setHours(hh, mm, 0, 0)
  const end = new Date(start.getTime() + 60 * 60 * 1000)

  const stamp = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${y}${m}${day}T${h}${min}00`
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: input.title,
    dates: `${stamp(start)}/${stamp(end)}`,
    location: input.address,
    details: input.details || '',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
