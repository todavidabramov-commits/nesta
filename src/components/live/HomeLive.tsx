'use client'

import { useState } from 'react'
import Link from 'next/link'

import { applyLiveGlobal, mapHomePage, mapProperty, type CmsDoc } from '@/cms/map'
import type { HomeView } from '@/cms/types'
import { isCmsMedia } from '@/cms/utils'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { HeroMedia } from '@/components/HeroMedia'
import { PropertyCard } from '@/components/PropertyCard'
import { SearchSelect } from '@/components/SearchSelect'
import type { SelectOption } from '@/components/searchSelectStyles'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { useLiveCollection, useLiveCollectionList, useLiveGlobalEvent } from '@/components/LivePreviewListener'
import { useLocale } from '@/i18n/locale-context'
import { btnClass, cn } from '@/lib/ui'

export function HomeLive({ initial }: { initial: HomeView }) {
  const { locale, messages } = useLocale()
  const page = useLiveCollection('pages', initial.page, (doc, prev) => mapHomePage(doc, prev))
  const properties = useLiveCollectionList(
    'properties',
    initial.properties,
    (doc, prev) => mapProperty(doc, prev),
    (item) => item.id || item.slug,
  )

  const liveGlobal = useLiveGlobalEvent()
  let header = initial.header
  let footer = initial.footer
  let settings = initial.settings
  if (liveGlobal?.globalSlug) {
    const next = applyLiveGlobal(header, footer, settings, liveGlobal.globalSlug, liveGlobal.data as CmsDoc)
    header = next.header
    footer = next.footer
    settings = next.settings
  }

  return (
    <div className="flex min-h-screen flex-col max-[700px]:pb-[72px]">
      <SiteHeader header={header} />
      <main>
        <section className="hero">
          <div className="hero__copy">
            <div className="hero__intro">
              <h1>{page.hero.headline}</h1>
              <p>{page.hero.lead}</p>
            </div>
            <SearchBox />
          </div>
          {page.hero.imageUrl ? (
            <HeroMedia
              src={page.hero.imageUrl}
              alt={page.hero.imageAlt || page.hero.headline}
              sizes="(max-width: 700px) 100vw, 660px"
              unoptimized={isCmsMedia(page.hero.imageUrl)}
            />
          ) : (
            <div className="hero__media" />
          )}
        </section>

        <section className="mx-auto w-full max-w-page px-[var(--page-pad)] pb-[120px] max-[700px]:pb-10">
          <div className="mb-8 flex items-end justify-between gap-6 max-[700px]:mb-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.06em] text-accent max-[700px]:mb-1 max-[700px]:text-[11px]">
                {page.featured.eyebrow}
              </p>
              <h2 className="m-0 font-display text-[32px] font-medium max-[700px]:text-2xl">
                {page.featured.headline}
              </h2>
            </div>
            <Link
              href={page.featured.linkHref}
              className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-forest max-[700px]:gap-1 max-[700px]:text-xs"
            >
              <span className="inline max-[700px]:hidden">{page.featured.linkLabel}</span>
              <span className="hidden max-[700px]:inline">{messages.home.featured.linkLabelShort}</span>
              <ArrowIcon />
            </Link>
          </div>
          <div className="property-cards-lift grid grid-cols-4 gap-6 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1 max-[700px]:gap-4">
            {properties.slice(0, 4).map((property) => (
              <PropertyCard
                key={property.id || property.slug || `property-${property.title}`}
                property={property}
                locale={locale}
                bedroomsOne={messages.home.bedroomsLabelOne}
                bedroomsMany={messages.home.bedroomsLabel}
              />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter footer={footer} settings={settings} />
      <MobileBottomNav />
    </div>
  )
}

function SearchBox() {
  const { locale, messages } = useLocale()
  const t = messages.home.search
  const search = messages.search
  const [mode, setMode] = useState<'buy' | 'rent'>('buy')
  const [neighborhood, setNeighborhood] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [beds, setBeds] = useState('')

  const neighborhoodOptions: SelectOption[] = messages.search.fallbackNeighborhoods.map((item) => ({
    value: item.slug,
    label: item.name,
  }))

  const typeOptions: SelectOption[] = [
    { value: 'apartment', label: search.propertyTypes.apartment },
    { value: 'canal-house', label: search.propertyTypes['canal-house'] },
    { value: 'penthouse', label: search.propertyTypes.penthouse },
    { value: 'loft', label: search.propertyTypes.loft },
    { value: 'new-development', label: search.propertyTypes['new-development'] },
  ]

  const buyPriceOptions: SelectOption[] = [
    { value: '500000', label: '€500,000' },
    { value: '750000', label: '€750,000' },
    { value: '1000000', label: '€1,000,000' },
    { value: '1500000', label: '€1,500,000' },
    { value: '2000000', label: '€2,000,000' },
  ]

  const rentPriceOptions: SelectOption[] = [
    { value: '2000', label: locale === 'ru' ? '€2 000/мес' : '€2,000/mo' },
    { value: '3000', label: locale === 'ru' ? '€3 000/мес' : '€3,000/mo' },
    { value: '4000', label: locale === 'ru' ? '€4 000/мес' : '€4,000/mo' },
    { value: '5000', label: locale === 'ru' ? '€5 000/мес' : '€5,000/mo' },
    { value: '7500', label: locale === 'ru' ? '€7 500/мес' : '€7,500/mo' },
  ]

  const bedsOptions: SelectOption[] = [
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' },
  ]

  const priceOptions = mode === 'rent' ? rentPriceOptions : buyPriceOptions
  const pricePlaceholder = mode === 'rent' ? t.priceValueRent : t.priceValue

  const switchMode = (next: 'buy' | 'rent') => {
    setMode(next)
    setMaxPrice('')
  }

  return (
    <form className="search-box" action={mode === 'rent' ? '/rent' : '/buy'} method="get">
      <div className="search-box__tabs" role="tablist" aria-label="Listing type">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'buy'}
          className={mode === 'buy' ? 'is-active' : undefined}
          onClick={() => switchMode('buy')}
        >
          {t.buy}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'rent'}
          className={mode === 'rent' ? 'is-active' : undefined}
          onClick={() => switchMode('rent')}
        >
          {t.rent}
        </button>
      </div>

      <div className="search-box__fields">
        <label>
          <span>{t.location}</span>
          <div className="search-box__field search-box__field--select">
            <SearchSelect
              instanceId="search-neighborhood"
              name="neighborhood"
              options={neighborhoodOptions}
              value={neighborhood}
              onChange={(value) => setNeighborhood(typeof value === 'string' ? value : value[0] || '')}
              placeholder={t.locationValue}
            />
          </div>
        </label>
        <label>
          <span className="search-box__type-desktop">{t.type}</span>
          <span className="search-box__type-mobile">{t.typeMobile}</span>
          <div className="search-box__field search-box__field--select">
            <SearchSelect
              instanceId="search-type"
              name="type"
              options={typeOptions}
              value={propertyType}
              onChange={(value) => setPropertyType(typeof value === 'string' ? value : value[0] || '')}
              placeholder={t.typeValue}
            />
          </div>
        </label>
        <label className="search-box__field--desktop-only">
          <span>{mode === 'rent' ? t.maxPriceRent : t.maxPrice}</span>
          <div className="search-box__field search-box__field--select">
            <SearchSelect
              instanceId="search-max-price"
              name="maxPrice"
              options={priceOptions}
              value={maxPrice}
              onChange={(value) => setMaxPrice(typeof value === 'string' ? value : value[0] || '')}
              placeholder={pricePlaceholder}
            />
          </div>
        </label>
        <label className="search-box__field--desktop-only">
          <span>{t.bedrooms}</span>
          <div className="search-box__field search-box__field--select">
            <SearchSelect
              instanceId="search-beds"
              name="beds"
              options={bedsOptions}
              value={beds}
              onChange={(value) => setBeds(typeof value === 'string' ? value : value[0] || '')}
              placeholder={t.bedsValue}
            />
          </div>
        </label>
      </div>

      <button type="submit" className={cn(btnClass('primary', 'block'), 'max-[700px]:py-3 max-[700px]:text-[13px]')}>
        {t.submit}
      </button>
    </form>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden>
      <path d="M2 7h9M8 3.5 11.5 7 8 10.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
