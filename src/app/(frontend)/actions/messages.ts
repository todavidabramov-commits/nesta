'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

import { getPayloadClient } from '@/lib/payload'

export type MessageActionResult =
  | { ok: true }
  | { ok: false; error: 'auth' | 'validation' | 'unknown' }

function asId(value: string): number | string {
  const numeric = Number(value)
  if (Number.isFinite(numeric) && String(numeric) === value) return numeric
  return value
}

export async function markCustomerMessageRead(messageId: string): Promise<MessageActionResult> {
  const id = String(messageId || '').trim()
  if (!id) return { ok: false, error: 'validation' }

  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: await headers() })
    if (!user || user.collection !== 'customers') {
      return { ok: false, error: 'auth' }
    }

    const doc = await payload.findByID({
      collection: 'customer-messages',
      id: asId(id),
      depth: 0,
      overrideAccess: true,
    })

    const customerRef = doc.customer
    const customerId =
      typeof customerRef === 'object' && customerRef && 'id' in customerRef
        ? String(customerRef.id)
        : String(customerRef ?? '')

    if (customerId !== String(user.id)) {
      return { ok: false, error: 'auth' }
    }

    if (doc.read) return { ok: true }

    await payload.update({
      collection: 'customer-messages',
      id: asId(id),
      data: {
        read: true,
        readAt: new Date().toISOString(),
      },
      overrideAccess: true,
    })

    revalidatePath('/dashboard')
    return { ok: true }
  } catch (error) {
    console.error('[markCustomerMessageRead]', error)
    return { ok: false, error: 'unknown' }
  }
}

export async function markAllCustomerMessagesRead(): Promise<MessageActionResult> {
  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: await headers() })
    if (!user || user.collection !== 'customers') {
      return { ok: false, error: 'auth' }
    }

    const numericId = Number(user.id)
    const customerFilter =
      Number.isFinite(numericId) && String(numericId) === String(user.id)
        ? { customer: { equals: numericId } }
        : { customer: { equals: user.id } }

    const unread = await payload.find({
      collection: 'customer-messages',
      where: {
        and: [customerFilter, { read: { equals: false } }],
      },
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })

    const now = new Date().toISOString()
    await Promise.all(
      unread.docs.map((doc) =>
        payload.update({
          collection: 'customer-messages',
          id: doc.id,
          data: { read: true, readAt: now },
          overrideAccess: true,
        }),
      ),
    )

    revalidatePath('/dashboard')
    return { ok: true }
  } catch (error) {
    console.error('[markAllCustomerMessagesRead]', error)
    return { ok: false, error: 'unknown' }
  }
}
