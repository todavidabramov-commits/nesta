'use server'

import { headers } from 'next/headers'

import { getLocale } from '@/i18n/get-locale'
import { getPayloadClient } from '@/lib/payload'
import { bookViewingSchema, parseForm } from '@/lib/validation'

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
  const parsed = parseForm(bookViewingSchema, {
    propertyId: input.propertyId,
    viewingDate: input.viewingDate,
    viewingTime: input.viewingTime,
  })
  if (!parsed.ok) {
    return { ok: false, error: Object.values(parsed.fieldErrors)[0] || 'missing' }
  }

  const { propertyId, viewingDate, viewingTime } = parsed.data
  const propertyNumericId = Number(propertyId)
  if (!Number.isFinite(propertyNumericId)) {
    return { ok: false, error: 'property' }
  }

  try {
    const locale = await getLocale()
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: await headers() })

    let customerId: number | undefined
    let name = input.name?.trim() || undefined
    let email = input.email?.trim() || undefined

    if (user && user.collection === 'customers') {
      customerId = Number(user.id)
      try {
        const customer = await payload.findByID({
          collection: 'customers',
          id: user.id,
          depth: 0,
          overrideAccess: true,
        })
        name =
          [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim() || name
        email = customer.email || email
      } catch {
        /* keep optional contact fields */
      }
    }

    const created = await payload.create({
      collection: 'viewing-requests',
      data: {
        property: propertyNumericId,
        viewingDate,
        viewingTime,
        status: 'confirmed',
        locale,
        customer: customerId,
        name,
        email,
      },
      overrideAccess: true,
    })
    return { ok: true, id: String(created.id) }
  } catch (error) {
    console.error('createViewingRequest failed', error)
    return { ok: false, error: 'server' }
  }
}
