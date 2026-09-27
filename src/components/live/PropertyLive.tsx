'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { applyLiveGlobal, mapProperty, type CmsDoc } from '@/cms/map'
import type { PropertyDetailView } from '@/cms/types'
import { isCmsMedia } from '@/cms/utils'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { PropertyCard } from '@/components/PropertyCard'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { useLiveCollection, useLiveCollectionList, useLiveGlobalEvent } from '@/components/LivePreviewListener'
import { useLocale } from '@/i18n/locale-context'
import { formatPropertyPrice } from '@/lib/format-price'
import { searchHref } from '@/lib/search-params'
import { btnClass, cn } from '@/lib/ui'

const PropertyLocationMap = dynamic(
  () => import('@/components/PropertyLocationMap').then((mod) => mod.PropertyLocationMap),
  {
    ssr: false,
    loading: () => <div className="property-location-map property-location-map--loading" aria-hidden />,
  },
)

export function PropertyLive({ initial }: { initial: PropertyDetailView }) {
  const { locale, messages } = useLocale()
  const t = messages.property

  const property = useLiveCollection('properties', initial.property, (doc, prev) =>
    mapProperty(doc, prev),
  )
  const related = useLiveCollectionList(
    'properties',
    initial.related,
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

  const gallery = property.galleryUrls.length > 0 ? property.galleryUrls : [property.coverUrl].filter(Boolean)
  const [activeImage, setActiveImage] = useState(0)
  const backHref = (property.listingType === 'rent' ? '/rent' : '/buy') as '/buy' | '/rent'
  const agent = property.agent
  const agentFirstName = agent?.name?.trim().split(/\s+/)[0] || agent?.name || ''
  const viewingHref = `/viewings?property=${encodeURIComponent(property.slug)}`
  const agentHref = agent
    ? `/agents/${agent.slug}?from=${encodeURIComponent(property.slug)}`
    : ''
  const crumbs = [
    {
      label: property.listingType === 'rent' ? t.breadcrumbRent : t.breadcrumbBuy,
      href: backHref,
    },
    {
      label: t.breadcrumbCity,
      href: backHref,
    },
    ...(property.neighborhood
      ? [
          {
            label: property.neighborhood,
            href: searchHref(backHref, {
              listingType: property.listingType,
              neighborhood: property.neighborhoodSlug ? [property.neighborhoodSlug] : undefined,
            }),
          },
        ]
      : []),
    { label: property.title },
  ]
  const builtYearLabel =
    property.yearBuilt > 0
      ? property.yearRenovated
        ? `${property.yearBuilt} (${t.renovated.replace('{year}', String(property.yearRenovated))})`
        : String(property.yearBuilt)
      : '—'
  const access =
    property.locationAccess.length > 0
      ? property.locationAccess
      : locale === 'ru'
        ? [
            { label: 'Метро Rokin', detail: '8 мин пешком' },
            { label: 'Площадь Дам', detail: '5 мин на велосипеде' },
            { label: 'Nine Streets', detail: '2 мин пешком' },
          ]
        : [
            { label: 'Rokin Metro Station', detail: '8 min walk' },
            { label: 'Dam Square', detail: '5 min bike' },
            { label: 'Nine Streets', detail: '2 min walk' },
          ]

  return (
    <div className="flex min-h-screen flex-col max-[700px]:pb-[72px]">
      <SiteHeader header={header} />
      <main>
        <div className="mx-auto max-w-page px-[var(--page-pad)] pb-20 pt-6">
          <Breadcrumbs items={crumbs} label={t.breadcrumbLabel} />

          <div className="mb-10 grid grid-cols-[1.7fr_1fr] gap-3 max-[1100px]:grid-cols-1">
            <div className="relative min-h-[420px] overflow-hidden rounded-md bg-line max-[1100px]:min-h-[280px] max-[700px]:min-h-[240px] max-[700px]:rounded-lg">
              {gallery[activeImage] ? (
                <Image
                  src={gallery[activeImage]}
                  alt={property.coverAlt || property.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 900px) 100vw, 66vw"
                  unoptimized={isCmsMedia(gallery[activeImage])}
                />
              ) : (
                <div className="h-full w-full bg-line" />
              )}
            </div>
            <div className="grid grid-rows-2 gap-3 max-[1100px]:grid-cols-2 max-[1100px]:grid-rows-none max-[700px]:hidden">
              {gallery.slice(1, 3).map((url, index) => (
                <button
                  key={`${url}-${index}`}
                  type="button"
                  className={cn(
                    'relative min-h-[200px] cursor-pointer overflow-hidden rounded-md border-0 bg-line p-0 max-[1100px]:min-h-[140px] max-[700px]:min-h-[100px]',
                    activeImage === index + 1 && 'outline outline-2 outline-offset-2 outline-forest',
                  )}
                  onClick={() => setActiveImage(index + 1)}
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 900px) 50vw, 280px"
                    unoptimized={isCmsMedia(url)}
                  />
                </button>
              ))}
              {gallery.length <= 1 ? (
                <>
                  <div className="min-h-[200px] overflow-hidden rounded-md bg-line max-[1100px]:min-h-[140px]" />
                  <div className="min-h-[200px] overflow-hidden rounded-md bg-line max-[1100px]:min-h-[140px]" />
                </>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(260px,0.7fr)] items-start gap-12 max-[1100px]:grid-cols-1 max-[1100px]:gap-7">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.06em] text-accent">
                {property.neighborhood}
              </p>
              <h1 className="mb-3 font-display text-[clamp(32px,3.5vw,44px)] font-medium leading-[1.15]">
                {property.title}
              </h1>
              <p className="mb-7 text-[28px] font-bold">
                {formatPropertyPrice(property.price, locale, property.listingType)}
              </p>

              <div className="mb-10 grid grid-cols-4 gap-4 border-y border-line py-5 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-muted">
                    {t.livingArea}
                  </span>
                  <strong className="text-base font-semibold">{property.areaM2} m²</strong>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-muted">
                    {t.bedrooms}
                  </span>
                  <strong className="text-base font-semibold">
                    {(property.bedrooms === 1
                      ? messages.home.bedroomsLabelOne
                      : messages.home.bedroomsLabel
                    ).replace('{count}', String(property.bedrooms))}
                  </strong>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-muted">
                    {t.energyLabel}
                  </span>
                  <strong className="text-base font-semibold">
                    {property.energyLabel || '—'}
                  </strong>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-muted">
                    {t.builtYear}
                  </span>
                  <strong className="text-base font-semibold">{builtYearLabel}</strong>
                </div>
              </div>

              {property.description || property.summary ? (
                <section className="mb-10">
                  <h2 className="mb-3 font-display text-2xl font-medium">{t.about}</h2>
                  <p className="m-0 text-[15px] leading-relaxed text-muted">
                    {property.description || property.summary}
                  </p>
                </section>
              ) : null}

              {property.highlights.length > 0 ? (
                <section className="mb-10">
                  <h2 className="mb-3 font-display text-2xl font-medium">{t.highlights}</h2>
                  <ul className="m-0 list-none space-y-2 p-0">
                    {property.highlights.map((item, index) => (
                      <li
                        key={`${index}-${item}`}
                        className="relative pl-5 text-[15px] leading-snug before:absolute before:left-0 before:top-[0.55em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-accent"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {property.floorPlanUrl ? (
                <section className="mb-10">
                  <h2 className="mb-3 font-display text-2xl font-medium">{t.floorPlan}</h2>
                  <div className="overflow-hidden rounded-md border border-line bg-surface p-4">
                    <Image
                      src={property.floorPlanUrl}
                      alt={t.floorPlan}
                      width={960}
                      height={560}
                      className="h-auto w-full"
                      unoptimized={
                        isCmsMedia(property.floorPlanUrl) ||
                        property.floorPlanUrl.endsWith('.svg')
                      }
                    />
                  </div>
                </section>
              ) : null}

              <section className="mb-10">
                <h2 className="mb-3 font-display text-2xl font-medium">{t.locationAccess}</h2>
                <div className="property-location">
                  <PropertyLocationMap
                    latitude={property.latitude}
                    longitude={property.longitude}
                    label={t.locationMapLabel}
                  />
                  <ul className="property-location__access">
                    {access.map((item) => {
                      const icon = locationAccessIcon(item.label, item.detail)
                      return (
                        <li key={`${item.label}-${item.detail}`}>
                          <span className="property-location__icon" aria-hidden>
                            <img src={icon} alt="" width={20} height={20} />
                          </span>
                          <div>
                            <strong>{item.label}</strong>
                            <span>{item.detail}</span>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </section>
            </div>

            <aside className="property-aside">
              <div className="property-booking">
                <h2>{t.scheduleTitle}</h2>
                <Link
                  href={viewingHref}
                  className={btnClass('primary', 'block')}
                >
                  {t.scheduleCta}
                </Link>
                {agent ? (
                  <>
                    <hr className="m-0 border-0 border-t border-line" />
                    <div className="flex items-center gap-4">
                      <Link
                        href={agentHref}
                        className="relative size-[54px] shrink-0 overflow-hidden rounded-full bg-line no-underline transition-opacity hover:opacity-85"
                      >
                        {agent.photoUrl ? (
                          <Image
                            src={agent.photoUrl}
                            alt={agent.photoAlt || agent.name}
                            fill
                            className="object-cover"
                            sizes="54px"
                            unoptimized={isCmsMedia(agent.photoUrl)}
                          />
                        ) : null}
                      </Link>
                      <div className="flex min-w-0 flex-col gap-1">
                        <Link
                          href={agentHref}
                          className="text-[15px] font-bold leading-tight text-ink no-underline transition-colors hover:text-forest"
                        >
                          {agent.name}
                        </Link>
                        <span className="text-[13px] leading-tight text-muted">{agent.role}</span>
                        <Link
                          href={agentHref}
                          className="mt-0.5 inline-flex items-center gap-1 text-[12px] font-semibold text-forest no-underline transition-opacity hover:opacity-80"
                        >
                          {t.viewAdvisor}
                          <span aria-hidden className="translate-y-px text-[11px]">
                            →
                          </span>
                        </Link>
                      </div>
                    </div>
                    <Link
                      href={agentHref}
                      className={btnClass('outline', 'block')}
                    >
                      <img src="/images/icon-mail.svg" alt="" width={14} height={14} />
                      {t.contactAgent.replace('{name}', agentFirstName)}
                    </Link>
                  </>
                ) : null}
              </div>
            </aside>
          </div>

          {related.length > 0 ? (
            <section className="mt-16">
              <h2 className="mb-6 font-display text-[28px] font-medium">{t.similar}</h2>
              <div className="grid grid-cols-4 gap-6 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1">
                {related.map((item) => (
                  <PropertyCard
                    key={item.id || item.slug || `related-${item.title}`}
                    property={item}
                    locale={locale}
                    bedroomsOne={messages.home.bedroomsLabelOne}
                    bedroomsMany={messages.home.bedroomsLabel}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>
      <SiteFooter footer={footer} settings={settings} />
      <MobileBottomNav />
    </div>
  )
}

function locationAccessIcon(label: string, detail: string): string {
  const text = `${label} ${detail}`.toLowerCase()
  if (/bike|велосипед|cycle|fiets/.test(text)) {
    return '/images/icon-location-bike.svg'
  }
  if (/metro|train|tram|transit|station|станц|метро|трамвай|поезд/.test(text)) {
    return '/images/icon-location-transit.svg'
  }
  return '/images/icon-location-walk.svg'
}
