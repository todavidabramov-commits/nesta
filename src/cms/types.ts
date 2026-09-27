import type { Locale } from '@/i18n/config'

export type CmsLocale = {
  locale: Locale
  fallbackLocale: Locale | false
}

export function cmsLocale(locale: Locale): CmsLocale {
  return {
    locale,
    // Prefer locale-specific map fallbacks over cross-locale CMS values,
    // so missing nested localized array fields don't flip the UI language.
    fallbackLocale: false,
  }
}

export type NavItem = {
  label: string
  href: string
}

export type HeaderView = {
  nav: NavItem[]
  signInLabel: string
  signInHref: string
  ctaLabel: string
  ctaHref: string
}

export type FooterLink = {
  label: string
  href: string
}

export type FooterColumn = {
  title: string
  links: FooterLink[]
}

export type FooterView = {
  tagline: string
  columns: FooterColumn[]
  copyright: string
  legal: FooterLink[]
}

export type SiteSettingsView = {
  companyName: string
  contacts: {
    title: string
    address: string
    email: string
    phone: string
    phoneHref: string
  }
}

export type PropertyLocationAccess = {
  label: string
  detail: string
}

export type AgentSummary = {
  id: string
  slug: string
  name: string
  role: string
  photoUrl: string
  photoAlt: string
}

export type AgentView = AgentSummary & {
  bio: string
  rating: number
  homesSold: number
  experienceYears: number
  experienceLabel: string
  email: string
}

export type PropertyView = {
  id: string
  slug: string
  title: string
  neighborhood: string
  neighborhoodSlug: string
  address: string
  price: number
  areaM2: number
  bedrooms: number
  energyLabel: string
  yearBuilt: number
  yearRenovated: number | null
  listingType: 'buy' | 'rent'
  propertyType: string
  latitude: number
  longitude: number
  coverUrl: string
  coverAlt: string
  galleryUrls: string[]
  featured: boolean
  summary: string
  description: string
  highlights: string[]
  floorPlanUrl: string
  locationAccess: PropertyLocationAccess[]
  agent: AgentSummary | null
}

export type NeighborhoodView = {
  id: string
  slug: string
  name: string
}

export type NeighborhoodGuideCard = NeighborhoodView & {
  vibe: string
  summary: string
  coverUrl: string
  coverAlt: string
  avgBuy: string
  avgRent: string
  activeCount: number
  lifestyle: Array<'historic' | 'bohemian' | 'waterfront' | 'family' | 'creative'>
}

export type NeighborhoodGuideDetail = NeighborhoodGuideCard & {
  heroUrl: string
  heroAlt: string
  headline: string
  body: string
  stats: Array<{ label: string; value: string }>
  transit: Array<{ label: string; icon: 'transit' | 'bike' }>
  sections: Array<{ title: string; body: string }>
}

export type NeighborhoodsDirectoryView = {
  neighborhoods: NeighborhoodGuideCard[]
  highestValuationName: string
  header: HeaderView
  footer: FooterView
  settings: SiteSettingsView
}

export type NeighborhoodDetailPageView = {
  neighborhood: NeighborhoodGuideDetail
  properties: PropertyView[]
  header: HeaderView
  footer: FooterView
  settings: SiteSettingsView
}

export type PropertyFilters = {
  listingType?: 'buy' | 'rent'
  propertyType?: string[]
  bedrooms?: number[]
  minPrice?: number
  maxPrice?: number[]
  neighborhood?: string[]
  sort?: 'order' | 'price' | '-price'
  limit?: number
}

export type SearchView = {
  properties: PropertyView[]
  total: number
  neighborhoods: NeighborhoodView[]
  filters: PropertyFilters
  header: HeaderView
  footer: FooterView
  settings: SiteSettingsView
}

export type PropertyDetailView = {
  property: PropertyView
  related: PropertyView[]
  header: HeaderView
  footer: FooterView
  settings: SiteSettingsView
}

export type AgentDetailView = {
  agent: AgentView
  properties: PropertyView[]
  header: HeaderView
  footer: FooterView
  settings: SiteSettingsView
}

export type MatchingView = {
  properties: PropertyView[]
  header: HeaderView
  footer: FooterView
  settings: SiteSettingsView
}

export type CompareView = {
  properties: PropertyView[]
  header: HeaderView
  footer: FooterView
  settings: SiteSettingsView
}

export type FavoritesView = {
  properties: PropertyView[]
  header: HeaderView
  footer: FooterView
  settings: SiteSettingsView
}

export type BookViewingView = {
  property: PropertyView | null
  properties: PropertyView[]
  header: HeaderView
  footer: FooterView
  settings: SiteSettingsView
  propertyLocked: boolean
  initialDate?: string
  initialTime?: string
}

export type ViewingItemView = {
  id: string
  date: string
  time: string
  status: 'new' | 'confirmed' | 'cancelled'
  whenLabel: string
  property: PropertyView
}

export type ViewingsView = {
  items: ViewingItemView[]
  header: HeaderView
  footer: FooterView
  settings: SiteSettingsView
}

export type DashboardView = {
  favorites: PropertyView[]
  viewings: ViewingItemView[]
  messages: CustomerMessageView[]
  savedSearches: SavedSearchView[]
  header: HeaderView
  footer: FooterView
  settings: SiteSettingsView
}

export type CustomerMessageView = {
  id: string
  title: string
  body: string
  read: boolean
  createdAt: string
  createdLabel: string
}

export type SavedSearchView = {
  id: string
  title: string
  detail: string
  purpose: 'buy' | 'rent'
  priorities: string[]
  budgetMin: number
  budgetMax: number
  bedrooms: number
  href: string
}

export type HomePageView = {
  title: string
  hero: {
    headline: string
    lead: string
    imageUrl: string
    imageAlt: string
  }
  featured: {
    eyebrow: string
    headline: string
    linkLabel: string
    linkHref: string
  }
}

export type HomeView = {
  page: HomePageView
  properties: PropertyView[]
  header: HeaderView
  footer: FooterView
  settings: SiteSettingsView
}
