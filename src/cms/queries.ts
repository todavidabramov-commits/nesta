import type { Where } from 'payload'

import { getPayloadClient } from '@/lib/payload'
import type { Locale } from '@/i18n/config'
import { getMessages } from '@/i18n/messages'
import {
  getNeighborhoodGuide,
  localizeNeighborhoodGuide,
  neighborhoodGuides,
} from '@/data/neighborhoods'

import {
  mapAgent,
  mapFooter,
  mapHeader,
  mapHomePage,
  mapNeighborhood,
  mapProperty,
  mapSiteSettings,
} from './map'
import {
  cmsLocale,
  type AgentDetailView,
  type AgentView,
  type BookViewingView,
  type CompareView,
  type CustomerMessageView,
  type DashboardView,
  type FavoritesView,
  type FooterView,
  type HeaderView,
  type HomePageView,
  type HomeView,
  type MatchingView,
  type NeighborhoodDetailPageView,
  type NeighborhoodGuideCard,
  type NeighborhoodsDirectoryView,
  type NeighborhoodView,
  type PropertyDetailView,
  type PropertyFilters,
  type PropertyView,
  type SavedSearchView,
  type SearchView,
  type SiteSettingsView,
  type ViewingItemView,
  type ViewingsView,
} from './types'
import {
  formatBudgetShort,
  isMatchingPriorityId,
  matchingSearchHref,
  type MatchingPrefs,
  type MatchingPriorityId,
  type MatchingPurpose,
} from '@/lib/matching'
import { formatConfirmWhen } from '@/lib/viewing'

function fallbackHome(locale: Locale): HomePageView {
  const t = getMessages(locale)
  return {
    title: t.home.title,
    hero: {
      headline: t.home.hero.headline,
      lead: t.home.hero.lead,
      imageUrl: '/images/hero.jpg',
      imageAlt: t.home.hero.imageAlt,
    },
    featured: {
      eyebrow: t.home.featured.eyebrow,
      headline: t.home.featured.headline,
      linkLabel: t.home.featured.linkLabel,
      linkHref: '/buy',
    },
  }
}

function fallbackHeader(locale: Locale): HeaderView {
  const t = getMessages(locale)
  return {
    nav: t.header.nav,
    signInLabel: t.header.signIn,
    signInHref: '/sign-in',
    ctaLabel: '',
    ctaHref: '',
  }
}

function fallbackFooter(locale: Locale): FooterView {
  const t = getMessages(locale)
  return {
    tagline: t.footer.tagline,
    columns: t.footer.columns,
    copyright: t.footer.copyright.replace('{year}', String(new Date().getFullYear())),
    legal: t.footer.legal,
  }
}

function fallbackSettings(locale: Locale): SiteSettingsView {
  const t = getMessages(locale)
  return {
    companyName: 'NESTA',
    contacts: {
      title: t.footer.contactTitle,
      address: t.footer.address,
      email: t.footer.email,
      phone: t.footer.phone,
      phoneHref: 'tel:+3120748190',
    },
  }
}

function fallbackProperties(locale: Locale): PropertyView[] {
  return getMessages(locale).home.fallbackProperties
}

function fallbackNeighborhoods(locale: Locale): NeighborhoodView[] {
  return getMessages(locale).search.fallbackNeighborhoods
}

async function loadGlobals(locale: Locale) {
  const payload = await getPayloadClient()
  const opts = cmsLocale(locale)
  const [headerDoc, footerDoc, settingsDoc] = await Promise.all([
    payload.findGlobal({ slug: 'header', depth: 0, ...opts }),
    payload.findGlobal({ slug: 'footer', depth: 0, ...opts }),
    payload.findGlobal({ slug: 'site-settings', depth: 0, ...opts }),
  ])
  return {
    header: mapHeader(headerDoc as unknown as Record<string, unknown>, fallbackHeader(locale)),
    footer: mapFooter(footerDoc as unknown as Record<string, unknown>, fallbackFooter(locale)),
    settings: mapSiteSettings(
      settingsDoc as unknown as Record<string, unknown>,
      fallbackSettings(locale),
    ),
  }
}

function buildPropertyWhere(filters: PropertyFilters): Where {
  const and: Where[] = []
  if (filters.listingType) {
    and.push({ listingType: { equals: filters.listingType } })
  }
  if (filters.propertyType?.length) {
    and.push(
      filters.propertyType.length === 1
        ? { propertyType: { equals: filters.propertyType[0] } }
        : { propertyType: { in: filters.propertyType } },
    )
  }
  if (filters.bedrooms?.length) {
    const minBeds = Math.min(...filters.bedrooms)
    if (minBeds > 0) and.push({ bedrooms: { greater_than_equal: minBeds } })
  }
  if (typeof filters.minPrice === 'number' && filters.minPrice > 0) {
    and.push({ price: { greater_than_equal: filters.minPrice } })
  }
  if (filters.maxPrice?.length) {
    const ceiling = Math.max(...filters.maxPrice)
    if (ceiling > 0) and.push({ price: { less_than_equal: ceiling } })
  }
  if (and.length === 0) return {}
  if (and.length === 1) return and[0]
  return { and }
}

function sortValue(sort?: PropertyFilters['sort']): string {
  if (sort === 'price' || sort === '-price') return sort
  return 'order'
}

function filterFallbackProperties(list: PropertyView[], filters: PropertyFilters): PropertyView[] {
  let next = [...list]
  if (filters.listingType) next = next.filter((p) => p.listingType === filters.listingType)
  if (filters.propertyType?.length) {
    next = next.filter((p) => filters.propertyType!.includes(p.propertyType))
  }
  if (filters.bedrooms?.length) {
    const minBeds = Math.min(...filters.bedrooms)
    next = next.filter((p) => p.bedrooms >= minBeds)
  }
  if (typeof filters.minPrice === 'number' && filters.minPrice > 0) {
    next = next.filter((p) => p.price >= filters.minPrice!)
  }
  if (filters.maxPrice?.length) {
    const ceiling = Math.max(...filters.maxPrice)
    next = next.filter((p) => p.price <= ceiling)
  }
  if (filters.neighborhood?.length) {
    next = next.filter((p) => filters.neighborhood!.includes(p.neighborhoodSlug))
  }
  if (filters.sort === 'price') next.sort((a, b) => a.price - b.price)
  else if (filters.sort === '-price') next.sort((a, b) => b.price - a.price)
  return next
}

export async function getHomeView(locale: Locale): Promise<HomeView> {
  try {
    const payload = await getPayloadClient()
    const opts = cmsLocale(locale)

    const [pages, properties, globals] = await Promise.all([
      payload.find({
        collection: 'pages',
        where: { slug: { equals: 'home' } },
        limit: 1,
        depth: 2,
        ...opts,
      }),
      payload.find({
        collection: 'properties',
        where: { featured: { equals: true } },
        sort: 'order',
        limit: 4,
        depth: 2,
        ...opts,
      }),
      loadGlobals(locale),
    ])

    const pageDoc = pages.docs[0]
    const page = pageDoc
      ? mapHomePage(pageDoc as unknown as Record<string, unknown>, fallbackHome(locale))
      : fallbackHome(locale)
    const mappedProperties =
      properties.docs.length > 0
        ? properties.docs.map((doc) => mapProperty(doc as unknown as Record<string, unknown>))
        : fallbackProperties(locale).slice(0, 4)

    return {
      page,
      properties: mappedProperties,
      ...globals,
    }
  } catch {
    return {
      page: fallbackHome(locale),
      properties: fallbackProperties(locale).slice(0, 4),
      header: fallbackHeader(locale),
      footer: fallbackFooter(locale),
      settings: fallbackSettings(locale),
    }
  }
}

export async function getPropertyBySlug(locale: Locale, slug: string): Promise<PropertyView | null> {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'properties',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
      ...cmsLocale(locale),
    })
    const doc = result.docs[0]
    return doc ? mapProperty(doc as unknown as Record<string, unknown>) : null
  } catch {
    return null
  }
}

export async function getSearchView(
  locale: Locale,
  filters: PropertyFilters,
): Promise<SearchView> {
  const normalized: PropertyFilters = {
    ...filters,
    sort: filters.sort || 'order',
    limit: filters.limit || 24,
  }

  try {
    const payload = await getPayloadClient()
    const opts = cmsLocale(locale)
    let where = buildPropertyWhere(normalized)

    if (normalized.neighborhood?.length) {
      const hoods = await payload.find({
        collection: 'neighborhoods',
        where:
          normalized.neighborhood.length === 1
            ? { slug: { equals: normalized.neighborhood[0] } }
            : { slug: { in: normalized.neighborhood } },
        limit: 50,
        depth: 0,
        ...opts,
      })
      const hoodIds = hoods.docs.map((doc) => doc.id).filter((id) => id != null)
      if (hoodIds.length) {
        const { neighborhood: _drop, ...rest } = normalized
        where = buildPropertyWhere({ ...rest })
        const hoodClause: Where =
          hoodIds.length === 1
            ? { neighborhood: { equals: hoodIds[0] } }
            : { neighborhood: { in: hoodIds } }
        where = Object.keys(where).length ? { and: [where, hoodClause] } : hoodClause
      }
    }

    const [result, neighborhoods, globals] = await Promise.all([
      payload.find({
        collection: 'properties',
        where,
        sort: sortValue(normalized.sort),
        limit: normalized.limit,
        depth: 2,
        ...opts,
      }),
      payload.find({
        collection: 'neighborhoods',
        sort: 'order',
        limit: 50,
        depth: 0,
        ...opts,
      }),
      loadGlobals(locale),
    ])

    return {
      properties: result.docs.map((doc) => mapProperty(doc as unknown as Record<string, unknown>)),
      total: result.totalDocs,
      neighborhoods: neighborhoods.docs.map((doc) =>
        mapNeighborhood(doc as unknown as Record<string, unknown>),
      ),
      filters: normalized,
      ...globals,
    }
  } catch {
    const properties = filterFallbackProperties(fallbackProperties(locale), normalized)
    return {
      properties,
      total: properties.length,
      neighborhoods: fallbackNeighborhoods(locale),
      filters: normalized,
      header: fallbackHeader(locale),
      footer: fallbackFooter(locale),
      settings: fallbackSettings(locale),
    }
  }
}

export async function getPropertyDetailView(
  locale: Locale,
  slug: string,
): Promise<PropertyDetailView | null> {
  try {
    const property = await getPropertyBySlug(locale, slug)
    if (!property) return null

    const payload = await getPayloadClient()
    const opts = cmsLocale(locale)

    let relatedWhere: Where = { slug: { not_equals: slug } }
    if (property.neighborhoodSlug) {
      const hood = await payload.find({
        collection: 'neighborhoods',
        where: { slug: { equals: property.neighborhoodSlug } },
        limit: 1,
        depth: 0,
        ...opts,
      })
      if (hood.docs[0]?.id != null) {
        relatedWhere = {
          and: [{ slug: { not_equals: slug } }, { neighborhood: { equals: hood.docs[0].id } }],
        }
      }
    }

    const [related, globals] = await Promise.all([
      payload.find({
        collection: 'properties',
        where: relatedWhere,
        sort: 'order',
        limit: 4,
        depth: 2,
        ...opts,
      }),
      loadGlobals(locale),
    ])

    let relatedMapped = related.docs.map((doc) =>
      mapProperty(doc as unknown as Record<string, unknown>),
    )
    if (relatedMapped.length < 4) {
      const more = await payload.find({
        collection: 'properties',
        where: { slug: { not_equals: slug } },
        sort: 'order',
        limit: 4,
        depth: 2,
        ...opts,
      })
      const seen = new Set(relatedMapped.map((p) => p.slug))
      for (const doc of more.docs) {
        const mapped = mapProperty(doc as unknown as Record<string, unknown>)
        if (seen.has(mapped.slug)) continue
        relatedMapped.push(mapped)
        if (relatedMapped.length >= 4) break
      }
    }

    return {
      property,
      related: relatedMapped,
      ...globals,
    }
  } catch {
    const fallback = fallbackProperties(locale).find((p) => p.slug === slug)
    if (!fallback) return null
    return {
      property: fallback,
      related: fallbackProperties(locale).filter((p) => p.slug !== slug).slice(0, 4),
      header: fallbackHeader(locale),
      footer: fallbackFooter(locale),
      settings: fallbackSettings(locale),
    }
  }
}

function fallbackAgent(locale: Locale): AgentView {
  const first = fallbackProperties(locale)[0]?.agent
  return {
    id: first?.id || '1',
    slug: first?.slug || 'sophie-martin',
    name: first?.name || 'Sophie Martin',
    role: first?.role || 'Senior Property Advisor',
    photoUrl: first?.photoUrl || '/images/agent-sophie.jpg',
    photoAlt: first?.photoAlt || first?.name || 'Sophie Martin',
    bio:
      locale === 'ru'
        ? 'Софи специализируется на исторических домах у каналов и люксовых квартирах в Ауд-Зейд и Йордане. Благодаря связям в кругах архитектурной охраны она находит off-market объекты для международных клиентов.'
        : 'Sophie specializes in historic canal house acquisitions and luxury apartments in Oud-Zuid and Jordaan. With deep connections within the local architectural preservation circles, she secures off-market residential masterpieces for selective international clients.',
    rating: 4.9,
    homesSold: 128,
    experienceYears: 8,
    experienceLabel:
      locale === 'ru'
        ? '8+ лет на премиальном рынке Амстердама'
        : '8+ Years in Amsterdam Premium Market',
    email: 'sophie@nesta.nl',
  }
}

export async function getAgentBySlug(locale: Locale, slug: string): Promise<AgentView | null> {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'agents',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
      ...cmsLocale(locale),
    })
    const doc = result.docs[0]
    return doc ? mapAgent(doc as unknown as Record<string, unknown>) : null
  } catch {
    return null
  }
}

export async function getAgentDetailView(
  locale: Locale,
  slug: string,
): Promise<AgentDetailView | null> {
  try {
    const agent = await getAgentBySlug(locale, slug)
    if (!agent) return null

    const payload = await getPayloadClient()
    const opts = cmsLocale(locale)
    const agentId =
      /^\d+$/.test(agent.id) ? Number(agent.id) : agent.id
    const [listings, globals] = await Promise.all([
      payload.find({
        collection: 'properties',
        where: { agent: { equals: agentId } },
        sort: 'order',
        limit: 8,
        depth: 2,
        ...opts,
      }),
      loadGlobals(locale),
    ])

    let properties = listings.docs.map((doc) =>
      mapProperty(doc as unknown as Record<string, unknown>),
    )
    if (properties.length === 0) {
      properties = fallbackProperties(locale).slice(0, 2)
    }

    return { agent, properties, ...globals }
  } catch {
    const agent = fallbackAgent(locale)
    if (agent.slug !== slug && slug !== 'sophie-martin') return null
    return {
      agent,
      properties: fallbackProperties(locale).slice(0, 2),
      header: fallbackHeader(locale),
      footer: fallbackFooter(locale),
      settings: fallbackSettings(locale),
    }
  }
}

export async function getMatchingView(locale: Locale): Promise<MatchingView> {
  try {
    const payload = await getPayloadClient()
    const [result, globals] = await Promise.all([
      payload.find({
        collection: 'properties',
        sort: 'order',
        limit: 40,
        depth: 2,
        ...cmsLocale(locale),
      }),
      loadGlobals(locale),
    ])
    return {
      properties: result.docs.map((doc) => mapProperty(doc as unknown as Record<string, unknown>)),
      ...globals,
    }
  } catch {
    return {
      properties: fallbackProperties(locale),
      header: fallbackHeader(locale),
      footer: fallbackFooter(locale),
      settings: fallbackSettings(locale),
    }
  }
}

export async function getDashboardView(
  locale: Locale,
  favoriteIds: string[] = [],
  customerId?: string,
): Promise<DashboardView> {
  const [favorites, viewings, messages, savedSearches] = await Promise.all([
    getFavoritesView(locale, favoriteIds),
    customerId
      ? getViewingsView(locale, customerId)
      : Promise.resolve({
          items: [] as ViewingItemView[],
          header: fallbackHeader(locale),
          footer: fallbackFooter(locale),
          settings: fallbackSettings(locale),
        }),
    customerId ? getCustomerMessages(locale, customerId) : Promise.resolve([] as CustomerMessageView[]),
    customerId
      ? getCustomerSavedSearches(locale, customerId)
      : Promise.resolve([] as SavedSearchView[]),
  ])
  return {
    favorites: favorites.properties,
    viewings: viewings.items,
    messages,
    savedSearches,
    header: favorites.header,
    footer: favorites.footer,
    settings: favorites.settings,
  }
}

function formatMessageDate(iso: string, locale: Locale) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function mapCustomerMessage(
  doc: Record<string, unknown>,
  locale: Locale,
): CustomerMessageView | null {
  const id = doc.id != null ? String(doc.id) : ''
  const title = typeof doc.title === 'string' ? doc.title.trim() : ''
  const body = typeof doc.body === 'string' ? doc.body.trim() : ''
  if (!id || !title || !body) return null
  const createdAt = typeof doc.createdAt === 'string' ? doc.createdAt : ''
  return {
    id,
    title,
    body,
    read: Boolean(doc.read),
    createdAt,
    createdLabel: createdAt ? formatMessageDate(createdAt, locale) : '',
  }
}

export async function getCustomerMessages(
  locale: Locale,
  customerId: string,
): Promise<CustomerMessageView[]> {
  try {
    const payload = await getPayloadClient()
    const id = String(customerId || '').trim()
    if (!id) return []

    const numericId = Number(id)
    const customerFilter =
      Number.isFinite(numericId) && String(numericId) === id
        ? { customer: { equals: numericId } }
        : { customer: { equals: id } }

    const result = await payload.find({
      collection: 'customer-messages',
      where: customerFilter,
      sort: '-createdAt',
      limit: 50,
      depth: 0,
      overrideAccess: true,
    })

    return result.docs
      .map((doc) => mapCustomerMessage(doc as unknown as Record<string, unknown>, locale))
      .filter((item): item is CustomerMessageView => Boolean(item))
  } catch (error) {
    console.error('[getCustomerMessages]', error)
    return []
  }
}

function savedSearchDetail(prefs: MatchingPrefs, locale: Locale): string {
  const t = getMessages(locale).matching
  const purpose = prefs.purpose === 'rent' ? t.purposeShortRent : t.purposeShortBuy
  const budget = `${formatBudgetShort(prefs.budgetMin, prefs.purpose, locale)}—${formatBudgetShort(prefs.budgetMax, prefs.purpose, locale)}`
  const beds = t.bedsValue.replace('{count}', prefs.bedrooms >= 4 ? '4+' : String(prefs.bedrooms))
  const priorityLabels = prefs.priorities
    .map((id) => t.priorityShort[id] || t.priorities[id])
    .filter(Boolean)
  const parts = [purpose, budget, beds]
  if (priorityLabels.length) parts.push(priorityLabels.join(', '))
  return parts.join(' · ')
}

function mapSavedSearchRow(
  row: Record<string, unknown>,
  locale: Locale,
): SavedSearchView | null {
  const id = row.id != null ? String(row.id) : ''
  const purpose: MatchingPurpose | null =
    row.purpose === 'rent' || row.purpose === 'buy' ? row.purpose : null
  const budgetMin = Number(row.budgetMin)
  const budgetMax = Number(row.budgetMax)
  const bedrooms = Number(row.bedrooms)
  if (!id || !purpose || !Number.isFinite(budgetMin) || !Number.isFinite(budgetMax)) return null
  if (!Number.isFinite(bedrooms) || bedrooms < 1 || bedrooms > 4) return null

  const priorities = (Array.isArray(row.priorities) ? row.priorities : [])
    .map(String)
    .filter(isMatchingPriorityId) as MatchingPriorityId[]

  const prefs: MatchingPrefs = {
    purpose,
    budgetMin,
    budgetMax,
    bedrooms,
    priorities,
  }

  const title =
    typeof row.title === 'string' && row.title.trim()
      ? row.title.trim()
      : savedSearchDetail(prefs, locale)

  return {
    id,
    title,
    detail: savedSearchDetail(prefs, locale),
    purpose,
    priorities,
    budgetMin,
    budgetMax,
    bedrooms,
    href: matchingSearchHref(prefs, true),
  }
}

export async function getCustomerSavedSearches(
  locale: Locale,
  customerId: string,
): Promise<SavedSearchView[]> {
  try {
    const payload = await getPayloadClient()
    const id = String(customerId || '').trim()
    if (!id) return []

    const doc = await payload.findByID({
      collection: 'customers',
      id,
      depth: 0,
      overrideAccess: true,
    })

    const rows = Array.isArray(doc.savedSearches) ? doc.savedSearches : []
    return rows
      .map((row) => mapSavedSearchRow(row as unknown as Record<string, unknown>, locale))
      .filter((item): item is SavedSearchView => Boolean(item))
      .reverse()
  } catch (error) {
    console.error('[getCustomerSavedSearches]', error)
    return []
  }
}

function viewingSortKey(date: string, time: string) {
  return `${date}T${time || '00:00'}`
}

function mapViewingItem(
  doc: Record<string, unknown>,
  locale: Locale,
): ViewingItemView | null {
  const propertyRaw = doc.property
  if (!propertyRaw || typeof propertyRaw !== 'object') return null
  const property = mapProperty(propertyRaw as Record<string, unknown>)
  if (!property.id && !property.slug) return null
  const date = String(doc.viewingDate || '').slice(0, 10)
  const time = String(doc.viewingTime || '')
  if (!date || !time) return null
  const status =
    doc.status === 'new' || doc.status === 'cancelled' || doc.status === 'confirmed'
      ? doc.status
      : 'confirmed'
  return {
    id: String(doc.id ?? ''),
    date,
    time,
    status,
    whenLabel: formatConfirmWhen(date, time, locale),
    property,
  }
}

export async function getViewingsView(
  locale: Locale,
  customerId: string,
): Promise<ViewingsView> {
  try {
    const payload = await getPayloadClient()
    const globals = await loadGlobals(locale)
    const id = String(customerId || '').trim()
    if (!id) return { items: [], ...globals }

    const numericId = Number(id)
    const customerFilter =
      Number.isFinite(numericId) && String(numericId) === id
        ? { customer: { equals: numericId } }
        : { customer: { equals: id } }

    const result = await payload.find({
      collection: 'viewing-requests',
      where: {
        and: [customerFilter, { status: { not_equals: 'cancelled' } }],
      },
      sort: 'viewingDate',
      limit: 50,
      depth: 2,
      overrideAccess: true,
      ...cmsLocale(locale),
    })

    const items = result.docs
      .map((doc) => mapViewingItem(doc as unknown as Record<string, unknown>, locale))
      .filter(Boolean) as ViewingItemView[]

    items.sort((a, b) =>
      viewingSortKey(a.date, a.time).localeCompare(viewingSortKey(b.date, b.time)),
    )

    return { items, ...globals }
  } catch {
    return {
      items: [],
      header: fallbackHeader(locale),
      footer: fallbackFooter(locale),
      settings: fallbackSettings(locale),
    }
  }
}

export async function getCompareView(locale: Locale, slugs: string[]): Promise<CompareView> {
  const ordered = [...new Set(slugs.map((s) => s.trim()).filter(Boolean))].slice(0, 3)
  try {
    const payload = await getPayloadClient()
    const globals = await loadGlobals(locale)
    if (ordered.length === 0) {
      return { properties: [], ...globals }
    }
    const result = await payload.find({
      collection: 'properties',
      where: { slug: { in: ordered } },
      limit: 3,
      depth: 2,
      ...cmsLocale(locale),
    })
    const mapped = result.docs.map((doc) => mapProperty(doc as unknown as Record<string, unknown>))
    const bySlug = new Map(mapped.map((p) => [p.slug, p]))
    return {
      properties: ordered.map((slug) => bySlug.get(slug)).filter(Boolean) as PropertyView[],
      ...globals,
    }
  } catch {
    const all = fallbackProperties(locale)
    const bySlug = new Map(all.map((p) => [p.slug, p]))
    return {
      properties: ordered.map((slug) => bySlug.get(slug)).filter(Boolean) as PropertyView[],
      header: fallbackHeader(locale),
      footer: fallbackFooter(locale),
      settings: fallbackSettings(locale),
    }
  }
}

export async function getFavoritesView(
  locale: Locale,
  propertyIds: string[],
): Promise<FavoritesView> {
  const ordered = [...new Set(propertyIds.map((id) => String(id).trim()).filter(Boolean))]
  try {
    const payload = await getPayloadClient()
    const globals = await loadGlobals(locale)
    if (ordered.length === 0) {
      return { properties: [], ...globals }
    }
    const idFilters = ordered.flatMap((id) => {
      const numeric = Number(id)
      if (Number.isFinite(numeric) && String(numeric) === id) return [numeric, id]
      return [id]
    })
    const result = await payload.find({
      collection: 'properties',
      where: { id: { in: [...new Set(idFilters)] } },
      limit: Math.max(ordered.length, 1),
      depth: 2,
      ...cmsLocale(locale),
    })
    const mapped = result.docs.map((doc) => mapProperty(doc as unknown as Record<string, unknown>))
    const byId = new Map(mapped.map((p) => [String(p.id), p]))
    return {
      properties: ordered.map((id) => byId.get(id)).filter(Boolean) as PropertyView[],
      ...globals,
    }
  } catch {
    return {
      properties: [],
      header: fallbackHeader(locale),
      footer: fallbackFooter(locale),
      settings: fallbackSettings(locale),
    }
  }
}

export async function getBookViewingView(
  locale: Locale,
  opts: { propertySlug?: string; date?: string; time?: string } = {},
): Promise<BookViewingView> {
  const initialDate = opts.date && /^\d{4}-\d{2}-\d{2}$/.test(opts.date) ? opts.date : undefined
  const initialTime = opts.time?.trim() || undefined
  const propertyLocked = Boolean(opts.propertySlug)

  try {
    const payload = await getPayloadClient()
    const cms = cmsLocale(locale)
    const [result, globals] = await Promise.all([
      payload.find({
        collection: 'properties',
        sort: 'order',
        limit: 40,
        depth: 2,
        ...cms,
      }),
      loadGlobals(locale),
    ])
    const properties = result.docs.map((doc) => mapProperty(doc as unknown as Record<string, unknown>))
    const property =
      (opts.propertySlug
        ? properties.find((p) => p.slug === opts.propertySlug) || null
        : null) ||
      properties.find((p) => p.featured) ||
      properties[0] ||
      null

    return {
      property,
      properties,
      propertyLocked,
      initialDate,
      initialTime,
      ...globals,
    }
  } catch {
    const properties = fallbackProperties(locale)
    const property =
      (opts.propertySlug
        ? properties.find((p) => p.slug === opts.propertySlug) || null
        : null) ||
      properties.find((p) => p.featured) ||
      properties[0] ||
      null
    return {
      property,
      properties,
      propertyLocked,
      initialDate,
      initialTime,
      header: fallbackHeader(locale),
      footer: fallbackFooter(locale),
      settings: fallbackSettings(locale),
    }
  }
}

function guideCards(
  locale: Locale,
  counts: Record<string, number> = {},
): NeighborhoodGuideCard[] {
  return neighborhoodGuides.map((guide) => {
    const item = localizeNeighborhoodGuide(guide, locale)
    return {
      id: item.id,
      slug: item.slug,
      name: item.name,
      vibe: item.vibe,
      summary: item.summary,
      coverUrl: item.coverUrl,
      coverAlt: item.coverAlt,
      avgBuy: item.avgBuy,
      avgRent: item.avgRent,
      activeCount: counts[guide.slug] ?? item.activeCount,
      lifestyle: item.lifestyle,
    }
  })
}

async function propertyCountsByNeighborhood(locale: Locale): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'properties',
      limit: 200,
      depth: 1,
      ...cmsLocale(locale),
    })
    for (const doc of result.docs) {
      const hood = doc.neighborhood as unknown
      let slug = ''
      if (hood && typeof hood === 'object' && 'slug' in hood) {
        slug = String((hood as { slug?: unknown }).slug || '')
      }
      if (!slug) continue
      counts[slug] = (counts[slug] || 0) + 1
    }
    return counts
  } catch {
    for (const property of fallbackProperties(locale)) {
      if (!property.neighborhoodSlug) continue
      counts[property.neighborhoodSlug] = (counts[property.neighborhoodSlug] || 0) + 1
    }
    return counts
  }
}

export async function getNeighborhoodsDirectoryView(
  locale: Locale,
): Promise<NeighborhoodsDirectoryView> {
  const counts = await propertyCountsByNeighborhood(locale)
  const neighborhoods = guideCards(locale, counts)
  const highest =
    neighborhoods.find((item) => item.slug === 'grachtengordel')?.name ||
    neighborhoods[0]?.name ||
    ''

  try {
    const globals = await loadGlobals(locale)
    return {
      neighborhoods,
      highestValuationName: highest,
      ...globals,
    }
  } catch {
    return {
      neighborhoods,
      highestValuationName: highest,
      header: fallbackHeader(locale),
      footer: fallbackFooter(locale),
      settings: fallbackSettings(locale),
    }
  }
}

export async function getNeighborhoodDetailView(
  locale: Locale,
  slug: string,
): Promise<NeighborhoodDetailPageView | null> {
  const guide = getNeighborhoodGuide(slug)
  if (!guide) return null

  const neighborhood = localizeNeighborhoodGuide(guide, locale)

  try {
    const payload = await getPayloadClient()
    const opts = cmsLocale(locale)
    const hood = await payload.find({
      collection: 'neighborhoods',
      where: { slug: { equals: slug } },
      limit: 1,
      ...opts,
    })

    let properties: PropertyView[] = []
    if (hood.docs[0]) {
      const result = await payload.find({
        collection: 'properties',
        where: { neighborhood: { equals: hood.docs[0].id } },
        limit: 4,
        depth: 2,
        sort: 'order',
        ...opts,
      })
      properties = result.docs.map((doc) =>
        mapProperty(doc as unknown as Record<string, unknown>),
      )
    }

    if (properties.length < 2) {
      const fallback = fallbackProperties(locale).filter(
        (item) => item.neighborhoodSlug === slug || properties.length === 0,
      )
      const seen = new Set(properties.map((p) => p.slug))
      for (const item of fallback) {
        if (seen.has(item.slug)) continue
        properties.push(item)
        if (properties.length >= 2) break
      }
      if (properties.length < 2) {
        for (const item of fallbackProperties(locale)) {
          if (seen.has(item.slug)) continue
          properties.push(item)
          seen.add(item.slug)
          if (properties.length >= 2) break
        }
      }
    }

    const globals = await loadGlobals(locale)
    return { neighborhood, properties, ...globals }
  } catch {
    const properties = fallbackProperties(locale)
      .filter((item) => item.neighborhoodSlug === slug)
      .slice(0, 2)
    const list =
      properties.length > 0 ? properties : fallbackProperties(locale).slice(0, 2)
    return {
      neighborhood,
      properties: list,
      header: fallbackHeader(locale),
      footer: fallbackFooter(locale),
      settings: fallbackSettings(locale),
    }
  }
}
