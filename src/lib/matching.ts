import type { PropertyView } from '@/cms/types'
import { formatPropertyPrice } from '@/lib/format-price'

export type MatchingPurpose = 'buy' | 'rent'

export type MatchingPriorityId =
  | 'space'
  | 'quiet'
  | 'transit'
  | 'schools'
  | 'center'
  | 'outdoor'
  | 'parking'

export type MatchingPrefs = {
  purpose: MatchingPurpose
  priorities: MatchingPriorityId[]
  budgetMin: number
  budgetMax: number
  bedrooms: number
}

export type MatchedProperty = {
  property: PropertyView
  score: number
  reasons: string[]
}

const BUDGET_BUY = { min: 100_000, max: 2_000_000, step: 25_000 }
const BUDGET_RENT = { min: 1_000, max: 8_000, step: 100 }

export function budgetBounds(purpose: MatchingPurpose) {
  return purpose === 'rent' ? BUDGET_RENT : BUDGET_BUY
}

function haystack(property: PropertyView): string {
  return [
    property.title,
    property.summary,
    property.description,
    property.neighborhood,
    ...property.highlights,
    ...property.locationAccess.map((a) => `${a.label} ${a.detail}`),
  ]
    .join(' ')
    .toLowerCase()
}

const PRIORITY_HINTS: Record<MatchingPriorityId, RegExp[]> = {
  space: [/space|простор|living|гостиная|large|больш|m²|m2|area|площад/],
  quiet: [/quiet|тих|calm|спокой|residential|тишин/],
  transit: [/metro|tram|transit|транспорт|station|станци|walk|пешк|min from/],
  schools: [/school|школ|education|образован/],
  center: [/center|центр|city|город|gracht|jordaan|nine streets/],
  outdoor: [/outdoor|двор|garden|сад|terrace|терраса|courtyard|балкон|balcony/],
  parking: [/parking|парков|garage|гараж/],
}

const PRIORITY_FALLBACK: Record<MatchingPriorityId, { en: string; ru: string }> = {
  space: {
    en: 'Generous living layout with room to spread out.',
    ru: 'Просторная планировка с местом для жизни.',
  },
  quiet: {
    en: 'Quiet neighborhood priorities matched.',
    ru: 'Спокойный район по вашим приоритетам.',
  },
  transit: {
    en: 'Close to public transport connections.',
    ru: 'Рядом с общественным транспортом.',
  },
  schools: {
    en: 'Access to good local schools.',
    ru: 'Доступ к хорошим школам рядом.',
  },
  center: {
    en: 'Walkable to the city center lifestyle.',
    ru: 'Пешком до городского центра.',
  },
  outdoor: {
    en: 'Outdoor space or private terrace options.',
    ru: 'Своё внешнее пространство / терраса.',
  },
  parking: {
    en: 'Practical parking or garage access.',
    ru: 'Удобная парковка или гараж.',
  },
}

function reasonFor(
  priority: MatchingPriorityId,
  property: PropertyView,
  locale: string,
): string {
  const hit = property.highlights.find((h) =>
    PRIORITY_HINTS[priority].some((re) => re.test(h.toLowerCase())),
  )
  if (hit) return hit
  return locale === 'ru' ? PRIORITY_FALLBACK[priority].ru : PRIORITY_FALLBACK[priority].en
}

export function scoreProperty(
  property: PropertyView,
  prefs: MatchingPrefs,
  locale: string,
): MatchedProperty | null {
  if (property.listingType !== prefs.purpose) return null

  let score = 42
  const reasons: string[] = []
  const text = haystack(property)

  if (prefs.bedrooms >= 4) {
    if (property.bedrooms >= 4) score += 18
    else if (property.bedrooms === 3) score += 8
    else return null
  } else if (property.bedrooms === prefs.bedrooms) {
    score += 18
  } else if (Math.abs(property.bedrooms - prefs.bedrooms) === 1) {
    score += 8
  } else {
    return null
  }

  if (property.price >= prefs.budgetMin && property.price <= prefs.budgetMax) {
    score += 22
    reasons.push(
      locale === 'ru' ? 'В пределах вашего бюджета' : 'Within your budget limit',
    )
  } else if (
    property.price >= prefs.budgetMin * 0.9 &&
    property.price <= prefs.budgetMax * 1.1
  ) {
    score += 10
  } else {
    return null
  }

  for (const priority of prefs.priorities) {
    const matched = PRIORITY_HINTS[priority].some((re) => re.test(text))
    if (matched) {
      score += 8
      reasons.push(reasonFor(priority, property, locale))
    } else if (reasons.length < 4) {
      score += 3
      reasons.push(reasonFor(priority, property, locale))
    }
  }

  if (property.featured) score += 4

  score = Math.min(98, Math.max(72, Math.round(score)))
  return {
    property,
    score,
    reasons: reasons.slice(0, 4),
  }
}

export function rankMatches(
  properties: PropertyView[],
  prefs: MatchingPrefs,
  locale: string,
  limit = 4,
): MatchedProperty[] {
  return properties
    .map((p) => scoreProperty(p, prefs, locale))
    .filter((m): m is MatchedProperty => Boolean(m))
    .sort((a, b) => b.score - a.score || a.property.price - b.property.price)
    .slice(0, limit)
}

export function formatBudgetShort(value: number, purpose: MatchingPurpose, locale: string) {
  if (purpose === 'rent') {
    return formatPropertyPrice(value, locale, 'rent')
  }
  if (value >= 1_000_000) {
    const m = value / 1_000_000
    const suffix = value >= 2_000_000 ? '+' : ''
    return `€${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M${suffix}`
  }
  return `€${Math.round(value / 1000)}k`
}
