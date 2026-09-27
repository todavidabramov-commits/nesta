'use server'

import { getLocale } from '@/i18n/get-locale'
import { getPayloadClient } from '@/lib/payload'

export type BookViewingResult =
  | { ok: true; id: string }
  | { ok: false; error: string }

export async function createViewingRequest(input: {
  propertyId: string
  viewingDate: string
  viewingTime: string
  name?: string
  email?: string
}): Promise<BookViewingResult> {
  const propertyId = String(input.propertyId || '').trim()
  const viewingDate = String(input.viewingDate || '').trim()
  const viewingTime = String(input.viewingTime || '').trim()

  if (!propertyId || !viewingDate || !viewingTime) {
    return { ok: false, error: 'missing' }
  }

  const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(viewingDate)
  if (!dateOk) return { ok: false, error: 'date' }

  const propertyNumericId = Number(propertyId)
  if (!Number.isFinite(propertyNumericId)) {
    return { ok: false, error: 'property' }
  }

  try {
    const locale = await getLocale()
    const payload = await getPayloadClient()
    const created = await payload.create({
      collection: 'viewing-requests',
      data: {
        property: propertyNumericId,
        viewingDate,
        viewingTime,
        status: 'confirmed',
        locale,
        name: input.name?.trim() || undefined,
        email: input.email?.trim() || undefined,
      },
      overrideAccess: false,
    })
    return { ok: true, id: String(created.id) }
  } catch (error) {
    console.error('createViewingRequest failed', error)
    return { ok: false, error: 'server' }
  }
}
