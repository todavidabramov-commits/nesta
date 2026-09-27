export function mediaUrl(value: unknown, fallback = ''): string {
  if (typeof value === 'string' && isMediaSrc(value)) return value
  if (value && typeof value === 'object') {
    const obj = value as {
      url?: unknown
      thumbnailURL?: unknown
      filename?: unknown
      sizes?: Record<string, { url?: unknown }>
    }
    const candidates = [obj.url, obj.thumbnailURL, obj.sizes?.thumbnail?.url, obj.sizes?.tablet?.url]
    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate) return candidate
    }
    if (typeof obj.filename === 'string' && obj.filename) return `/api/media/file/${encodeURIComponent(obj.filename)}`
  }
  return fallback
}

export function mediaId(value: unknown): string | number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value && !isMediaSrc(value)) return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'number' || (typeof id === 'string' && id)) return id
  }
  return null
}

export function isMediaSrc(value: string) {
  return (
    value.startsWith('/') ||
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('blob:')
  )
}

export function isCmsMedia(src: string) {
  return (
    src.startsWith('/api/media') ||
    src.startsWith('/media/') ||
    src.includes('blob.vercel-storage.com') ||
    src.startsWith('blob:')
  )
}

export function asList<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

export function text(value: unknown, fallback = '', live = false): string {
  if (typeof value !== 'string') return fallback
  if (live) return value
  return value.trim() ? value : fallback
}
