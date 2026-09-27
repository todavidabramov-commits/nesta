'use server'

import { headers } from 'next/headers'

import { getPayloadClient } from '@/lib/payload'

export type FavoriteActionResult =
  | { ok: true; favorited: boolean; favoriteIds: string[] }
  | { ok: false; error: 'auth' | 'validation' | 'unknown' }

function relationIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const ids: string[] = []
  for (const item of value) {
    if (typeof item === 'number' || typeof item === 'string') {
      ids.push(String(item))
      continue
    }
    if (item && typeof item === 'object' && 'id' in item) {
      const id = (item as { id?: unknown }).id
      if (typeof id === 'number' || typeof id === 'string') ids.push(String(id))
    }
  }
  return [...new Set(ids)]
}

function asRelationId(value: string): number | string {
  const numeric = Number(value)
  if (Number.isFinite(numeric) && String(numeric) === value) return numeric
  return value
}

export async function toggleFavorite(propertyId: string): Promise<FavoriteActionResult> {
  const id = String(propertyId || '').trim()
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

    const current = relationIds(doc.favorites)
    const favorited = !current.includes(id)
    const nextIds = favorited ? [...current, id] : current.filter((item) => item !== id)
    const next = nextIds.map(asRelationId)

    await payload.update({
      collection: 'customers',
      id: user.id,
      data: { favorites: next },
      overrideAccess: true,
    })

    const updated = await payload.findByID({
      collection: 'customers',
      id: user.id,
      depth: 0,
      overrideAccess: true,
    })

    return { ok: true, favorited, favoriteIds: relationIds(updated.favorites) }
  } catch (error) {
    console.error('[toggleFavorite]', error)
    return { ok: false, error: 'unknown' }
  }
}
