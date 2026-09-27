import type { PropertyFilters } from '@/cms/types'

function one(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key]
  return Array.isArray(value) ? value[0] : value
}

function many(params: Record<string, string | string[] | undefined>, ...keys: string[]): string[] {
  const values: string[] = []
  for (const key of keys) {
    const raw = params[key]
    if (raw == null) continue
    const list = Array.isArray(raw) ? raw : [raw]
    for (const item of list) {
      for (const part of item.split(',')) {
        const trimmed = part.trim()
        if (trimmed && !values.includes(trimmed)) values.push(trimmed)
      }
    }
  }
  return values
}

function parsePositiveInts(values: string[]): number[] {
  const next: number[] = []
  for (const raw of values) {
    const n = Number.parseInt(raw.replace(/\D/g, ''), 10)
    if (Number.isFinite(n) && n > 0 && !next.includes(n)) next.push(n)
  }
  return next
}

export function parseSearchParams(
  listingType: 'buy' | 'rent',
  params: Record<string, string | string[] | undefined>,
): PropertyFilters {
  const beds = parsePositiveInts(many(params, 'beds', 'bedrooms'))
  const maxPrice = parsePositiveInts(many(params, 'maxPrice', 'price'))
  const minPriceRaw = one(params, 'minPrice')
  const minPrice = minPriceRaw ? Number.parseInt(minPriceRaw.replace(/\D/g, ''), 10) : undefined
  const propertyType = many(params, 'type', 'propertyType')
  const neighborhood = many(params, 'neighborhood', 'location')
  const sortRaw = one(params, 'sort')

  let sort: PropertyFilters['sort'] = 'order'
  if (sortRaw === 'price' || sortRaw === '-price') sort = sortRaw

  return {
    listingType,
    propertyType: propertyType.length ? propertyType : undefined,
    bedrooms: beds.length ? beds : undefined,
    minPrice: Number.isFinite(minPrice) && minPrice! > 0 ? minPrice : undefined,
    maxPrice: maxPrice.length ? maxPrice : undefined,
    neighborhood: neighborhood.length ? neighborhood : undefined,
    sort,
  }
}

export function searchHref(
  base: '/buy' | '/rent',
  filters: PropertyFilters,
  patch: Partial<PropertyFilters> = {},
): string {
  const next: PropertyFilters = { ...filters, ...patch }
  const qs = new URLSearchParams()

  for (const value of next.propertyType || []) qs.append('type', value)
  for (const value of next.bedrooms || []) qs.append('beds', String(value))
  if (next.minPrice) qs.set('minPrice', String(next.minPrice))
  for (const value of next.maxPrice || []) qs.append('maxPrice', String(value))
  for (const value of next.neighborhood || []) qs.append('neighborhood', value)
  if (next.sort && next.sort !== 'order') qs.set('sort', next.sort)

  const query = qs.toString()
  return query ? `${base}?${query}` : base
}

export function withoutFilterValue<K extends 'propertyType' | 'neighborhood' | 'bedrooms' | 'maxPrice'>(
  filters: PropertyFilters,
  key: K,
  value: string | number,
): Partial<PropertyFilters> {
  const current = filters[key]
  if (!current?.length) return { [key]: undefined } as Partial<PropertyFilters>
  const next = current.filter((item) => String(item) !== String(value))
  return { [key]: next.length ? next : undefined } as Partial<PropertyFilters>
}
