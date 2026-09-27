import { mediaUrl, text } from './utils'
import type {
  AgentSummary,
  AgentView,
  FooterView,
  HeaderView,
  HomePageView,
  NeighborhoodView,
  PropertyView,
  SiteSettingsView,
} from './types'

export type CmsDoc = Record<string, unknown>

function neighborhoodName(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'name' in value) {
    return text((value as { name?: unknown }).name, fallback)
  }
  return fallback
}

function neighborhoodSlug(value: unknown, fallback = ''): string {
  if (value && typeof value === 'object' && 'slug' in value) {
    return text((value as { slug?: unknown }).slug, fallback)
  }
  return fallback
}

function galleryUrlsFromDoc(doc: CmsDoc, coverUrl: string): string[] {
  const urls: string[] = []
  if (Array.isArray(doc.gallery)) {
    for (const row of doc.gallery) {
      const item = (row || {}) as CmsDoc
      const url = mediaUrl(item.image, '')
      if (url) urls.push(url)
    }
  }
  if (urls.length === 0 && coverUrl) urls.push(coverUrl)
  return urls
}

function highlightsFromDoc(doc: CmsDoc, fallback: string[] = []): string[] {
  if (!Array.isArray(doc.highlights)) return fallback
  return doc.highlights
    .map((row) => text(((row || {}) as CmsDoc).text, '', true))
    .filter(Boolean)
}

function locationAccessFromDoc(
  doc: CmsDoc,
  fallback: PropertyView['locationAccess'] = [],
): PropertyView['locationAccess'] {
  if (!Array.isArray(doc.locationAccess)) return fallback
  const next = doc.locationAccess
    .map((row) => {
      const item = (row || {}) as CmsDoc
      const label = text(item.label, '', true)
      const detail = text(item.detail, '', true)
      if (!label || !detail) return null
      return { label, detail }
    })
    .filter(Boolean) as PropertyView['locationAccess']
  return next.length ? next : fallback
}

function docId(value: unknown, fallback = ''): string {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (typeof value === 'string' && value) return value
  return fallback
}

export function mapAgentSummary(value: unknown, initial?: AgentSummary | null): AgentSummary | null {
  if (!value || typeof value !== 'object') return initial ?? null
  const doc = value as CmsDoc
  if (!('slug' in doc) && !('name' in doc)) return initial ?? null
  const photo = doc.photo
  const photoUrl = mediaUrl(photo, initial?.photoUrl || '')
  return {
    id: docId(doc.id, initial?.id || ''),
    slug: text(doc.slug, initial?.slug || ''),
    name: text(doc.name, initial?.name || '', true),
    role: text(doc.role, initial?.role || '', true),
    photoUrl,
    photoAlt:
      photo && typeof photo === 'object' && 'alt' in photo
        ? text((photo as { alt?: unknown }).alt, initial?.photoAlt || '')
        : initial?.photoAlt || text(doc.name, '', true),
  }
}

export function mapAgent(doc: CmsDoc, initial?: AgentView): AgentView {
  const summary = mapAgentSummary(doc, initial) || {
    id: '',
    slug: '',
    name: '',
    role: '',
    photoUrl: '',
    photoAlt: '',
  }
  return {
    ...summary,
    bio: text(doc.bio, initial?.bio || '', true),
    rating: typeof doc.rating === 'number' ? doc.rating : (initial?.rating ?? 4.9),
    homesSold: typeof doc.homesSold === 'number' ? doc.homesSold : (initial?.homesSold ?? 0),
    experienceYears:
      typeof doc.experienceYears === 'number'
        ? doc.experienceYears
        : (initial?.experienceYears ?? 8),
    experienceLabel: text(doc.experienceLabel, initial?.experienceLabel || '', true),
    email: text(doc.email, initial?.email || ''),
  }
}

export function mapProperty(doc: CmsDoc, initial?: PropertyView): PropertyView {
  const cover = doc.cover
  const coverUrl = mediaUrl(cover, initial?.coverUrl || '')
  return {
    id: docId(doc.id, initial?.id || ''),
    slug: text(doc.slug, initial?.slug || ''),
    title: text(doc.title, initial?.title || '', true),
    neighborhood: neighborhoodName(doc.neighborhood, initial?.neighborhood || ''),
    neighborhoodSlug: neighborhoodSlug(doc.neighborhood, initial?.neighborhoodSlug || ''),
    address: text(doc.address, initial?.address || ''),
    price: typeof doc.price === 'number' ? doc.price : (initial?.price ?? 0),
    areaM2: typeof doc.areaM2 === 'number' ? doc.areaM2 : (initial?.areaM2 ?? 0),
    bedrooms: typeof doc.bedrooms === 'number' ? doc.bedrooms : (initial?.bedrooms ?? 0),
    energyLabel: text(doc.energyLabel, initial?.energyLabel || ''),
    yearBuilt:
      typeof doc.yearBuilt === 'number' ? doc.yearBuilt : (initial?.yearBuilt ?? 0),
    yearRenovated:
      typeof doc.yearRenovated === 'number'
        ? doc.yearRenovated
        : doc.yearRenovated === null
          ? null
          : (initial?.yearRenovated ?? null),
    listingType: doc.listingType === 'rent' ? 'rent' : 'buy',
    propertyType: text(doc.propertyType, initial?.propertyType || 'apartment'),
    latitude: Number.isFinite(doc.latitude) ? Number(doc.latitude) : (initial?.latitude ?? 52.3676),
    longitude: Number.isFinite(doc.longitude) ? Number(doc.longitude) : (initial?.longitude ?? 4.9041),
    coverUrl,
    coverAlt:
      cover && typeof cover === 'object' && 'alt' in cover
        ? text((cover as { alt?: unknown }).alt, initial?.coverAlt || '')
        : initial?.coverAlt || '',
    galleryUrls: galleryUrlsFromDoc(doc, coverUrl),
    featured: Boolean(doc.featured ?? initial?.featured),
    summary: text(doc.summary, initial?.summary || '', true),
    description: text(doc.description, initial?.description || '', true),
    highlights: highlightsFromDoc(doc, initial?.highlights || []),
    floorPlanUrl: mediaUrl(doc.floorPlan, initial?.floorPlanUrl || '/images/floor-plan.svg'),
    locationAccess: locationAccessFromDoc(doc, initial?.locationAccess || []),
    agent: mapAgentSummary(doc.agent, initial?.agent ?? null),
  }
}

export function mapNeighborhood(doc: CmsDoc): NeighborhoodView {
  return {
    id: docId(doc.id),
    slug: text(doc.slug, ''),
    name: text(doc.name, '', true),
  }
}

export function mapHeader(doc: CmsDoc, initial?: HeaderView): HeaderView {
  const nav = Array.isArray(doc.nav)
    ? doc.nav.map((item, index) => {
        const row = (item || {}) as CmsDoc
        const fallback = initial?.nav[index]
        return {
          label: text(row.label, fallback?.label || ''),
          href: text(row.href, fallback?.href || '#'),
        }
      })
    : initial?.nav || []

  return {
    nav,
    signInLabel: text(doc.signInLabel, initial?.signInLabel || 'Sign in'),
    signInHref: text(doc.signInHref, initial?.signInHref || '/sign-in'),
    ctaLabel: text(doc.ctaLabel, initial?.ctaLabel || 'List a property'),
    ctaHref: text(doc.ctaHref, initial?.ctaHref || '/list-property'),
  }
}

export function mapFooter(doc: CmsDoc, initial?: FooterView): FooterView {
  const columns = Array.isArray(doc.columns)
    ? doc.columns.map((col, colIndex) => {
        const row = (col || {}) as CmsDoc
        const fallbackCol = initial?.columns[colIndex]
        const links = Array.isArray(row.links)
          ? row.links.map((link, linkIndex) => {
              const item = (link || {}) as CmsDoc
              const fallbackLink = fallbackCol?.links[linkIndex]
              return {
                label: text(item.label, fallbackLink?.label || ''),
                href: text(item.href, fallbackLink?.href || '#'),
              }
            })
          : fallbackCol?.links || []
        return {
          title: text(row.title, fallbackCol?.title || ''),
          links,
        }
      })
    : initial?.columns || []

  const legal = Array.isArray(doc.legal)
    ? doc.legal.map((link, index) => {
        const item = (link || {}) as CmsDoc
        const fallback = initial?.legal[index]
        return {
          label: text(item.label, fallback?.label || ''),
          href: text(item.href, fallback?.href || '#'),
        }
      })
    : initial?.legal || []

  return {
    tagline: text(doc.tagline, initial?.tagline || ''),
    columns,
    copyright: text(doc.copyright, initial?.copyright || ''),
    legal,
  }
}

export function mapSiteSettings(doc: CmsDoc, initial?: SiteSettingsView): SiteSettingsView {
  const contacts = (doc.contacts && typeof doc.contacts === 'object' ? doc.contacts : {}) as CmsDoc
  const fallback = initial?.contacts

  return {
    companyName: text(doc.companyName, initial?.companyName || 'NESTA'),
    contacts: {
      title: text(contacts.title, fallback?.title || '', true),
      address: text(contacts.address, fallback?.address || '', true),
      email: text(contacts.email, fallback?.email || ''),
      phone: text(contacts.phone, fallback?.phone || ''),
      phoneHref: text(contacts.phoneHref, fallback?.phoneHref || ''),
    },
  }
}

export function mapHomePage(doc: CmsDoc, initial?: HomePageView): HomePageView {
  const hero = (doc.hero || {}) as CmsDoc
  const featured = (doc.featured || {}) as CmsDoc
  const image = hero.heroImage

  return {
    title: text(doc.title, initial?.title || 'Home', true),
    hero: {
      headline: text(hero.headline, initial?.hero.headline || '', true),
      lead: text(hero.lead, initial?.hero.lead || '', true),
      imageUrl: mediaUrl(image, initial?.hero.imageUrl || ''),
      imageAlt:
        image && typeof image === 'object' && 'alt' in image
          ? text((image as { alt?: unknown }).alt, initial?.hero.imageAlt || '')
          : initial?.hero.imageAlt || '',
    },
    featured: {
      eyebrow: text(featured.eyebrow, initial?.featured.eyebrow || '', true),
      headline: text(featured.headline, initial?.featured.headline || '', true),
      linkLabel: text(featured.linkLabel, initial?.featured.linkLabel || '', true),
      linkHref: text(featured.linkHref, initial?.featured.linkHref || '/buy'),
    },
  }
}

export function applyLiveGlobal(
  header: HeaderView,
  footer: FooterView,
  settings: SiteSettingsView,
  globalSlug: string,
  data: CmsDoc,
): { header: HeaderView; footer: FooterView; settings: SiteSettingsView } {
  if (globalSlug === 'header') return { header: mapHeader(data, header), footer, settings }
  if (globalSlug === 'footer') return { header, footer: mapFooter(data, footer), settings }
  if (globalSlug === 'site-settings') {
    return { header, footer, settings: mapSiteSettings(data, settings) }
  }
  return { header, footer, settings }
}
