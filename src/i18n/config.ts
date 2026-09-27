export const LOCALES = ['ru', 'en'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'ru'

/** Same cookie Payload admin reads in getRequestLanguage. */
export const LOCALE_COOKIE = 'payload-lng'

export const LOCALE_MAX_AGE = 60 * 60 * 24 * 365

export function isLocale(value: string | undefined | null): value is Locale {
  return value === 'ru' || value === 'en'
}
