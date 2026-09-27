import type { GeneratePreviewURL } from 'payload'

const COLLECTION_PATH: Record<string, (data: Record<string, unknown>) => string> = {
  properties: (data) =>
    typeof data.slug === 'string' && data.slug ? `/properties/${data.slug}` : '/',
  agents: (data) =>
    typeof data.slug === 'string' && data.slug ? `/agents/${data.slug}` : '/',
  neighborhoods: (data) =>
    typeof data.slug === 'string' && data.slug ? `/neighborhoods/${data.slug}` : '/neighborhoods',
  pages: (data) => {
    const slug = typeof data.slug === 'string' ? data.slug : ''
    if (!slug || slug === 'home' || slug === 'index') return '/'
    return `/${slug}`
  },
}

const GLOBAL_PATH: Record<string, string> = {
  'site-settings': '/',
  header: '/',
  footer: '/',
}

function withLocale(path: string, locale?: string | null) {
  if (!locale) return path
  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}lng=${encodeURIComponent(locale)}`
}

export function previewPath(slug: string, data: Record<string, unknown> = {}) {
  if (GLOBAL_PATH[slug]) return GLOBAL_PATH[slug]
  return COLLECTION_PATH[slug]?.(data) || null
}

export function collectionPreview(collection: keyof typeof COLLECTION_PATH): GeneratePreviewURL {
  return (doc, { locale }) => {
    const path = previewPath(collection, doc)
    return path ? withLocale(path, locale) : null
  }
}

export function globalPreview(slug: keyof typeof GLOBAL_PATH): GeneratePreviewURL {
  return (_doc, { locale }) => withLocale(GLOBAL_PATH[slug], locale)
}
