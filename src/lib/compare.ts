export const COMPARE_MAX = 3
export const COMPARE_MIN = 2
export const COMPARE_STORAGE_KEY = 'nesta-compare-slugs'

export function normalizeCompareSlugs(slugs: string[]): string[] {
  const seen = new Set<string>()
  const next: string[] = []
  for (const raw of slugs) {
    const slug = raw.trim()
    if (!slug || seen.has(slug)) continue
    seen.add(slug)
    next.push(slug)
    if (next.length >= COMPARE_MAX) break
  }
  return next
}

export function compareHref(slugs: string[]) {
  const list = normalizeCompareSlugs(slugs)
  if (list.length < COMPARE_MIN) return '/compare'
  const qs = new URLSearchParams()
  for (const slug of list) qs.append('p', slug)
  return `/compare?${qs.toString()}`
}
