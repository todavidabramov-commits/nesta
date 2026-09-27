'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { applyLiveGlobal, type CmsDoc } from '@/cms/map'
import type { CompareView, PropertyView } from '@/cms/types'
import { isCmsMedia } from '@/cms/utils'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { useCompare } from '@/components/CompareProvider'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { useLiveGlobalEvent } from '@/components/LivePreviewListener'
import { useLocale } from '@/i18n/locale-context'
import { COMPARE_MIN } from '@/lib/compare'
import { formatPropertyPrice } from '@/lib/format-price'
import { btnClass, cn, pageShell } from '@/lib/ui'

function outdoorLabel(property: PropertyView, t: ReturnType<typeof useLocale>['messages']['compare']) {
  const text = [...property.highlights, property.summary, property.description].join(' ').toLowerCase()
  if (/terrace|терраса|roof/.test(text)) return t.outdoorTerrace
  if (/balcony|балкон|courtyard|двор|garden|сад|outdoor/.test(text)) return t.outdoorBalcony
  return t.outdoorNone
}

function bathroomCount(property: PropertyView) {
  if (property.bedrooms >= 3) return 2
  if (property.bedrooms === 2) return 1.5
  return 1
}

function hoaEstimate(property: PropertyView) {
  return Math.round(80 + property.areaM2 * 0.9)
}

export function CompareLive({ initial }: { initial: CompareView }) {
  const router = useRouter()
  const { locale, messages } = useLocale()
  const t = messages.compare
  const home = messages.home
  const compare = useCompare()

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

  const [properties, setProperties] = useState(initial.properties)

  useEffect(() => {
    setProperties(initial.properties)
  }, [initial.properties])

  useEffect(() => {
    if (initial.properties.length === 0 && compare.canCompare) {
      router.replace(compare.href)
    }
  }, [initial.properties.length, compare.canCompare, compare.href, router])

  useEffect(() => {
    if (initial.properties.length >= COMPARE_MIN) {
      compare.setSlugs(initial.properties.map((p) => p.slug))
    }
    // sync URL selection into store once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const crumbs = useMemo(
    () => [
      { label: t.breadcrumbHome, href: '/' },
      { label: t.breadcrumbBuy, href: '/buy' },
      { label: t.breadcrumbCurrent },
    ],
    [t.breadcrumbHome, t.breadcrumbBuy, t.breadcrumbCurrent],
  )

  const cols = properties.length

  const rows = [
    {
      key: 'price',
      label: t.rows.price,
      values: properties.map((p) => formatPropertyPrice(p.price, locale, p.listingType)),
    },
    {
      key: 'area',
      label: t.rows.area,
      values: properties.map((p) => `${p.areaM2} m²`),
    },
    {
      key: 'bedrooms',
      label: t.rows.bedrooms,
      values: properties.map((p) =>
        (locale === 'ru' && p.bedrooms === 1 ? home.bedroomsLabelOne : home.bedroomsLabel).replace(
          '{count}',
          String(p.bedrooms),
        ),
      ),
    },
    {
      key: 'bathrooms',
      label: t.rows.bathrooms,
      values: properties.map((p) => {
        const n = bathroomCount(p)
        const template = n === 1 ? t.bathsOne : t.baths
        return template.replace('{count}', String(n))
      }),
    },
    {
      key: 'energy',
      label: t.rows.energy,
      values: properties.map((p) => p.energyLabel || '—'),
    },
    {
      key: 'neighborhood',
      label: t.rows.neighborhood,
      values: properties.map((p) => p.neighborhood),
    },
    {
      key: 'hoa',
      label: t.rows.hoa,
      values: properties.map((p) =>
        t.hoaMonth.replace(
          '{price}',
          formatPropertyPrice(hoaEstimate(p), locale, 'buy').replace(/\s/g, '\u00a0'),
        ),
      ),
    },
    {
      key: 'outdoor',
      label: t.rows.outdoor,
      values: properties.map((p) => outdoorLabel(p, t)),
    },
  ]

  return (
    <div className="flex min-h-screen flex-col max-[700px]:pb-[72px]">
      <SiteHeader header={header} />
      <main className="flex-1">
        <div className={cn(pageShell, 'pt-6 max-[700px]:pt-4')}>
          <Breadcrumbs items={crumbs} label={t.breadcrumbLabel} />
        </div>

        <div className={cn(pageShell, 'flex flex-col gap-10 pb-24 pt-2 max-[700px]:gap-5 max-[700px]:pb-10')}>
          <header className="flex flex-col gap-2">
            <h1 className="m-0 font-display text-[40px] font-medium leading-none text-ink max-[700px]:text-[32px]">
              {t.title}
            </h1>
            <p className="m-0 text-[15px] text-muted max-[700px]:text-sm max-[700px]:leading-[1.4]">
              <span className="max-[700px]:hidden">{t.lead}</span>
              <span className="hidden max-[700px]:inline">{t.leadMobile}</span>
            </p>
          </header>

          {cols < COMPARE_MIN ? (
            <div className="rounded-md border border-line bg-surface p-8 text-center max-[700px]:p-5">
              <p className="m-0 text-sm text-muted">{t.empty}</p>
              <Link
                href="/buy"
                className={cn(btnClass('primary', 'sm'), 'mt-5 inline-flex no-underline shadow-none')}
              >
                {messages.header.nav[0]?.label || t.breadcrumbBuy}
              </Link>
            </div>
          ) : (
            <>
              {/* Mobile header cards */}
              <div className="hidden gap-3 overflow-x-auto max-[900px]:flex">
                {properties.map((property) => (
                  <div
                    key={property.slug}
                    className="flex w-[112px] shrink-0 flex-col gap-2 rounded-lg border border-line bg-surface p-2"
                  >
                    <div className="relative h-[70px] overflow-hidden rounded-sm bg-line">
                      {property.coverUrl ? (
                        <Image
                          src={property.coverUrl}
                          alt={property.coverAlt || property.title}
                          fill
                          className="object-cover"
                          sizes="112px"
                          unoptimized={isCmsMedia(property.coverUrl)}
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-[9px] font-bold uppercase text-accent">
                        {property.neighborhood}
                      </p>
                      <p className="m-0 overflow-hidden text-ellipsis whitespace-nowrap font-display text-xs font-semibold">
                        {property.title}
                      </p>
                      <p className="m-0 text-[11px] font-bold">
                        {formatPropertyPrice(property.price, locale, property.listingType)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop comparison table */}
              <div className="overflow-hidden rounded-md border border-line bg-surface max-[900px]:hidden">
                <div
                  className="grid gap-6 border-b border-line p-6"
                  style={{ gridTemplateColumns: `240px repeat(${cols}, minmax(0, 1fr))` }}
                >
                  <div />
                  {properties.map((property) => (
                    <div key={property.slug} className="flex min-w-0 items-center gap-4">
                      <div className="relative size-20 shrink-0 overflow-hidden rounded-sm bg-line">
                        {property.coverUrl ? (
                          <Image
                            src={property.coverUrl}
                            alt={property.coverAlt || property.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                            unoptimized={isCmsMedia(property.coverUrl)}
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="m-0 text-xs font-bold uppercase tracking-[0.04em] text-accent">
                          {property.neighborhood}
                        </p>
                        <p className="m-0 overflow-hidden text-ellipsis whitespace-nowrap font-display text-base font-semibold">
                          {property.title}
                        </p>
                        <p className="m-0 text-sm font-bold">
                          {formatPropertyPrice(property.price, locale, property.listingType)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {rows.map((row, index) => (
                  <div
                    key={row.key}
                    className={cn(
                      'grid gap-6 border-b border-line px-5 py-5 last:border-b-0',
                      index % 2 === 1 ? 'bg-[#faf8f5]' : 'bg-surface',
                    )}
                    style={{ gridTemplateColumns: `240px repeat(${cols}, minmax(0, 1fr))` }}
                  >
                    <p className="m-0 text-sm font-bold text-muted">{row.label}</p>
                    {row.values.map((value, i) => (
                      <p
                        key={`${row.key}-${i}`}
                        className={cn('m-0 text-sm text-ink', i === 0 ? 'font-semibold' : 'font-normal')}
                      >
                        {value}
                      </p>
                    ))}
                  </div>
                ))}
              </div>

              {/* Mobile comparison matrix */}
              <div className="hidden overflow-hidden rounded-xl border border-line bg-surface max-[900px]:block">
                <div
                  className="grid gap-2.5 border-b border-line bg-[#faf8f5] p-2.5 text-[11px] font-bold"
                  style={{ gridTemplateColumns: `90px repeat(${cols}, minmax(0, 1fr))` }}
                >
                  <span className="text-muted">{locale === 'ru' ? 'Параметр' : 'Specification'}</span>
                  {properties.map((p) => (
                    <span
                      key={p.slug}
                      className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-forest"
                    >
                      {p.title}
                    </span>
                  ))}
                </div>
                {rows.map((row, index) => (
                  <div
                    key={row.key}
                    className={cn(
                      'grid gap-2.5 border-b border-line p-3 last:border-b-0',
                      index % 2 === 1 ? 'bg-[#faf8f5]' : 'bg-surface',
                    )}
                    style={{ gridTemplateColumns: `90px repeat(${cols}, minmax(0, 1fr))` }}
                  >
                    <span className="text-[11px] font-bold text-muted">{row.label}</span>
                    {row.values.map((value, i) => (
                      <span
                        key={`${row.key}-m-${i}`}
                        className="text-center text-xs text-ink"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter footer={footer} settings={settings} />
      <MobileBottomNav />
    </div>
  )
}
