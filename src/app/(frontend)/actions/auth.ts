'use server'

import { cookies, headers } from 'next/headers'
import { generatePayloadCookie, getCookieExpiration } from 'payload/shared'

import { getPayloadClient } from '@/lib/payload'
import { parseForm, profileSchema, registerSchema, signInSchema } from '@/lib/validation'

export type AuthActionResult =
  | { ok: true }
  | { ok: false; error: 'validation' | 'exists' | 'credentials' | 'unknown' }

type RegisterInput = {
  email: string
  password: string
  firstName: string
  lastName: string
  intent: 'buy' | 'rent'
  newsletter: boolean
}

type SignInInput = {
  email: string
  password: string
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

async function setAuthCookie(token: string) {
  const payload = await getPayloadClient()
  const collection = payload.collections.customers
  const authConfig = collection.config.auth
  if (!authConfig) throw new Error('customers auth missing')

  const cookie = generatePayloadCookie({
    collectionAuthConfig: authConfig,
    cookiePrefix: payload.config.cookiePrefix,
    token,
    returnCookieAsObject: true,
  })

  const store = await cookies()
  store.set(cookie.name, cookie.value || '', {
    httpOnly: cookie.httpOnly ?? true,
    path: cookie.path || '/',
    sameSite: (cookie.sameSite?.toLowerCase() as 'lax' | 'strict' | 'none') || 'lax',
    secure: cookie.secure ?? process.env.NODE_ENV === 'production',
    expires: cookie.expires ? new Date(cookie.expires) : getCookieExpiration({ seconds: authConfig.tokenExpiration }),
  })
}

export async function registerCustomer(input: RegisterInput): Promise<AuthActionResult> {
  const parsed = parseForm(registerSchema, {
    ...input,
    agree: true,
  })
  if (!parsed.ok) return { ok: false, error: 'validation' }

  const email = normalizeEmail(parsed.data.email)
  const { password, firstName, lastName, intent, newsletter } = parsed.data

  try {
    const payload = await getPayloadClient()

    const existing = await payload.find({
      collection: 'customers',
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (existing.docs.length > 0) {
      return { ok: false, error: 'exists' }
    }

    await payload.create({
      collection: 'customers',
      data: {
        email,
        password,
        firstName,
        lastName,
        intent,
        newsletter,
      },
      overrideAccess: true,
    })

    const login = await payload.login({
      collection: 'customers',
      data: { email, password },
    })

    if (!login.token) return { ok: false, error: 'unknown' }
    await setAuthCookie(login.token)
    return { ok: true }
  } catch {
    return { ok: false, error: 'unknown' }
  }
}

export async function signInCustomer(input: SignInInput): Promise<AuthActionResult> {
  const parsed = parseForm(signInSchema, input)
  if (!parsed.ok) return { ok: false, error: 'validation' }

  const email = normalizeEmail(parsed.data.email)
  const password = parsed.data.password

  try {
    const payload = await getPayloadClient()
    const login = await payload.login({
      collection: 'customers',
      data: { email, password },
    })
    if (!login.token) return { ok: false, error: 'credentials' }
    await setAuthCookie(login.token)
    return { ok: true }
  } catch {
    return { ok: false, error: 'credentials' }
  }
}

export async function signOutCustomer(): Promise<void> {
  const payload = await getPayloadClient()
  const store = await cookies()
  const name = `${payload.config.cookiePrefix}-token`
  store.set(name, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  })
}

export type ProfileActionResult =
  | { ok: true }
  | { ok: false; error: 'auth' | 'validation' | 'credentials' | 'unknown' }

const MAX_AVATAR_BYTES = 5 * 1024 * 1024
const AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export async function updateCustomerProfile(formData: FormData): Promise<ProfileActionResult> {
  const parsed = parseForm(profileSchema, {
    firstName: String(formData.get('firstName') || ''),
    lastName: String(formData.get('lastName') || ''),
    currentPassword: String(formData.get('currentPassword') || ''),
    newPassword: String(formData.get('newPassword') || ''),
    confirmPassword: String(formData.get('confirmPassword') || ''),
  })
  if (!parsed.ok) return { ok: false, error: 'validation' }

  const { firstName, lastName, currentPassword, newPassword } = parsed.data
  const photo = formData.get('photo')
  const wantsPasswordChange = Boolean(currentPassword || newPassword)

  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: await headers() })
    if (!user || user.collection !== 'customers') {
      return { ok: false, error: 'auth' }
    }

    const email = typeof user.email === 'string' ? user.email : ''
    if (wantsPasswordChange) {
      if (!email) return { ok: false, error: 'unknown' }
      try {
        await payload.login({
          collection: 'customers',
          data: { email, password: currentPassword },
        })
      } catch {
        return { ok: false, error: 'credentials' }
      }
    }

    const data: {
      firstName: string
      lastName: string
      avatar?: number
      password?: string
    } = {
      firstName,
      lastName,
    }

    if (wantsPasswordChange) {
      data.password = newPassword
    }

    if (photo instanceof File && photo.size > 0) {
      if (photo.size > MAX_AVATAR_BYTES || (photo.type && !AVATAR_TYPES.has(photo.type))) {
        return { ok: false, error: 'validation' }
      }
      const buffer = Buffer.from(await photo.arrayBuffer())
      const media = await payload.create({
        collection: 'media',
        data: {
          alt: `${firstName} ${lastName}`.trim() || 'Avatar',
        },
        file: {
          data: buffer,
          mimetype: photo.type || 'image/jpeg',
          name: photo.name || 'avatar.jpg',
          size: photo.size,
        },
        overrideAccess: true,
      })
      data.avatar = Number(media.id)
    }

    await payload.update({
      collection: 'customers',
      id: user.id,
      data,
      overrideAccess: true,
    })

    return { ok: true }
  } catch {
    return { ok: false, error: 'unknown' }
  }
}
