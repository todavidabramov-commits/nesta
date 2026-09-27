import { headers } from 'next/headers'

import { mediaUrl } from '@/cms/utils'
import { getPayloadClient } from '@/lib/payload'

export type CustomerSession = {
  id: string
  email: string
  firstName: string
  lastName: string
  photoUrl: string
  intent: 'buy' | 'rent' | null
  newsletter: boolean
  favoriteIds: string[]
}

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

export async function getCustomerSession(): Promise<CustomerSession | null> {
  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: await headers() })
    if (!user || user.collection !== 'customers') return null

    const doc = await payload.findByID({
      collection: 'customers',
      id: user.id,
      depth: 1,
      overrideAccess: true,
    })

    return {
      id: String(doc.id),
      email: doc.email,
      firstName: doc.firstName || '',
      lastName: doc.lastName || '',
      photoUrl: mediaUrl(doc.avatar),
      intent: doc.intent === 'rent' || doc.intent === 'buy' ? doc.intent : null,
      newsletter: Boolean(doc.newsletter),
      favoriteIds: relationIds(doc.favorites),
    }
  } catch {
    return null
  }
}
