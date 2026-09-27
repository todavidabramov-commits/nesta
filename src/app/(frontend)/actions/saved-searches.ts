'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

import {
  matchingPrefsEqual,
  type MatchingPrefs,
  type MatchingPriorityId,
  type MatchingPurpose,
  isMatchingPriorityId,
} from '@/lib/matching'
import { getPayloadClient } from '@/lib/payload'

export type SavedSearchActionResult =
  | { ok: true; id: string }
  | { ok: false; error: 'auth' | 'validation' | 'duplicate' | 'limit' | 'unknown' }

export type DeleteSavedSearchResult =
  | { ok: true }
  | { ok: false; error: 'auth' | 'validation' | 'unknown' }

const MAX_SAVED = 20

type SavedSearchRow = {
  id?: string | null
  title?: string | null
  purpose?: string | null
  priorities?: string[] | null
  budgetMin?: number | null
  budgetMax?: number | null
  bedrooms?: number | null
}

function normalizePrefs(input: MatchingPrefs): MatchingPrefs | null {
  const purpose: MatchingPurpose = input.purpose === 'rent' ? 'rent' : 'buy'
  const budgetMin = Number(input.budgetMin)
  const budgetMax = Number(input.budgetMax)
  const bedrooms = Number(input.bedrooms)
  if (!Number.isFinite(budgetMin) || !Number.isFinite(budgetMax) || budgetMin >= budgetMax) {
    return null
  }
  if (!Number.isFinite(bedrooms) || bedrooms < 1 || bedrooms > 4) return null
  const priorities = (input.priorities || [])
    .filter(isMatchingPriorityId)
    .slice(0, 3) as MatchingPriorityId[]
  return { purpose, budgetMin, budgetMax, bedrooms, priorities }
}

function rowToPrefs(row: SavedSearchRow): MatchingPrefs | null {
  if (!row.purpose || row.budgetMin == null || row.budgetMax == null || row.bedrooms == null) {
    return null
  }
  return normalizePrefs({
    purpose: row.purpose as MatchingPurpose,
    budgetMin: row.budgetMin,
    budgetMax: row.budgetMax,
    bedrooms: row.bedrooms,
    priorities: (row.priorities || []).filter(isMatchingPriorityId),
  })
}

function stripRow(row: SavedSearchRow) {
  return {
    id: row.id || undefined,
    title: String(row.title || ''),
    purpose: (row.purpose === 'rent' ? 'rent' : 'buy') as MatchingPurpose,
    priorities: (row.priorities || []).filter(isMatchingPriorityId),
    budgetMin: Number(row.budgetMin),
    budgetMax: Number(row.budgetMax),
    bedrooms: Number(row.bedrooms),
  }
}

function defaultTitle(prefs: MatchingPrefs, locale: 'ru' | 'en') {
  const purpose = prefs.purpose === 'rent'
    ? locale === 'ru' ? 'Аренда' : 'Rent'
    : locale === 'ru' ? 'Купить' : 'Buy'
  const beds = prefs.bedrooms >= 4 ? '4+' : String(prefs.bedrooms)
  const bedsLabel = locale === 'ru' ? `${beds} сп.` : `${beds} bed`
  return `${purpose} · ${bedsLabel}`
}

export async function saveMatchingSearch(input: {
  prefs: MatchingPrefs
  title?: string
  locale?: 'ru' | 'en'
}): Promise<SavedSearchActionResult> {
  const prefs = normalizePrefs(input.prefs)
  if (!prefs) return { ok: false, error: 'validation' }

  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: await headers() })
    if (!user || user.collection !== 'customers') {
      return { ok: false, error: 'auth' }
    }

    const doc = await payload.findByID({
      collection: 'customers',
      id: user.id,
      depth: 0,
      overrideAccess: true,
    })

    const existing = (Array.isArray(doc.savedSearches) ? doc.savedSearches : []) as SavedSearchRow[]
    for (const row of existing) {
      const rowPrefs = rowToPrefs(row)
      if (rowPrefs && matchingPrefsEqual(rowPrefs, prefs)) {
        return { ok: false, error: 'duplicate' }
      }
    }
    if (existing.length >= MAX_SAVED) {
      return { ok: false, error: 'limit' }
    }

    const locale = input.locale === 'en' ? 'en' : 'ru'
    const title = String(input.title || '').trim() || defaultTitle(prefs, locale)
    const nextRow = {
      title,
      purpose: prefs.purpose,
      priorities: prefs.priorities,
      budgetMin: prefs.budgetMin,
      budgetMax: prefs.budgetMax,
      bedrooms: prefs.bedrooms,
    }

    await payload.update({
      collection: 'customers',
      id: user.id,
      data: {
        savedSearches: [...existing.map(stripRow), nextRow],
      },
      overrideAccess: true,
    })

    const refreshed = await payload.findByID({
      collection: 'customers',
      id: user.id,
      depth: 0,
      overrideAccess: true,
    })
    const rows = (Array.isArray(refreshed.savedSearches) ? refreshed.savedSearches : []) as SavedSearchRow[]
    const created = rows[rows.length - 1]
    revalidatePath('/dashboard')
    revalidatePath('/matching')
    return { ok: true, id: String(created?.id || '') }
  } catch (error) {
    console.error('[saveMatchingSearch]', error)
    return { ok: false, error: 'unknown' }
  }
}

export async function deleteSavedSearch(searchId: string): Promise<DeleteSavedSearchResult> {
  const id = String(searchId || '').trim()
  if (!id) return { ok: false, error: 'validation' }

  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: await headers() })
    if (!user || user.collection !== 'customers') {
      return { ok: false, error: 'auth' }
    }

    const doc = await payload.findByID({
      collection: 'customers',
      id: user.id,
      depth: 0,
      overrideAccess: true,
    })

    const existing = (Array.isArray(doc.savedSearches) ? doc.savedSearches : []) as SavedSearchRow[]
    const next = existing.filter((row) => String(row.id || '') !== id)
    if (next.length === existing.length) {
      return { ok: false, error: 'validation' }
    }

    await payload.update({
      collection: 'customers',
      id: user.id,
      data: { savedSearches: next.map(stripRow) },
      overrideAccess: true,
    })

    revalidatePath('/dashboard')
    return { ok: true }
  } catch (error) {
    console.error('[deleteSavedSearch]', error)
    return { ok: false, error: 'unknown' }
  }
}
