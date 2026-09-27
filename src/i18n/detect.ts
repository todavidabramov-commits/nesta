import { DEFAULT_LOCALE, type Locale } from './config'

const CIS = new Set(['ru', 'uk', 'be', 'kk', 'ky', 'uz', 'tg', 'hy', 'az', 'mo'])

export function detectLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE

  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=')
      return { tag: (tag || '').toLowerCase(), q: q ? Number(q) : 1 }
    })
    .filter((item) => item.tag)
    .sort((a, b) => b.q - a.q)

  for (const { tag } of ranked) {
    const base = tag.split('-')[0]
    if (base === 'en') return 'en'
    if (base === 'ru' || CIS.has(base)) return 'ru'
  }

  return 'en'
}
