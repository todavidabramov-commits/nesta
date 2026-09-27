import type { Where } from 'payload'

import { getPayloadClient } from '@/lib/payload'
import type { Locale } from '@/i18n/config'
import { getMessages } from '@/i18n/messages'

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
  type FooterView,
  type HeaderView,
  type HomePageView,
  type HomeView,
  type MatchingView,
  type NeighborhoodView,
  type PropertyDetailView,
  type PropertyFilters,
  type PropertyView,
  type SearchView,
  type SiteSettingsView,
} from './types'

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
    ctaLabel: t.header.cta,
    ctaHref: '/list-property',
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
        limit: 8,
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
        : fallbackProperties(locale)

    return {
      page,
      properties: mappedProperties,
      ...globals,
    }
  } catch {
    return {
      page: fallbackHome(locale),
      properties: fallbackProperties(locale),
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
