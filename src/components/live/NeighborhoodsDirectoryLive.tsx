'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useMemo, useState } from 'react'

import { applyLiveGlobal, type CmsDoc } from '@/cms/map'
import type { NeighborhoodGuideCard, NeighborhoodsDirectoryView } from '@/cms/types'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { SearchSelect } from '@/components/SearchSelect'
import type { SelectOption } from '@/components/searchSelectStyles'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { useLiveGlobalEvent } from '@/components/LivePreviewListener'
import { useLocale } from '@/i18n/locale-context'
import { btnClass, cn, pageShell } from '@/lib/ui'

type FilterId = 'all' | 'historic' | 'bohemian' | 'waterfront' | 'family' | 'creative'
type SortId = 'valuation' | 'name'

function parseBuyValue(value: string) {
  const digits = value.replace(/[^\d]/g, '')
  return Number(digits) || 0
}

export function NeighborhoodsDirectoryLive({ initial }: { initial: NeighborhoodsDirectoryView }) {
  const { messages } = useLocale()
  const t = messages.neighborhoods

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

  const [filter, setFilter] = useState<FilterId>('all')
  const [sort, setSort] = useState<SortId>('valuation')

  const lifestyleFilters: Array<{ id: FilterId; label: string }> = [
    { id: 'all', label: t.filters.all },
    { id: 'historic', label: t.filters.historic },
    { id: 'bohemian', label: t.filters.bohemian },
    { id: 'waterfront', label: t.filters.waterfront },
    { id: 'family', label: t.filters.family },
    { id: 'creative', label: t.filters.creative },
  ]

  const sortOptions: SelectOption[] = useMemo(
    () => [
      { value: 'valuation', label: t.sortValuation },
      { value: 'name', label: t.sortName },
    ],
    [t.sortName, t.sortValuation],
  )

  const items = useMemo(() => {
    let next = initial.neighborhoods
    if (filter !== 'all') {
      next = next.filter((item) => item.lifestyle.includes(filter))
    }
    next = [...next].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      return parseBuyValue(b.avgBuy) - parseBuyValue(a.avgBuy)
    })
    return next
  }, [filter, initial.neighborhoods, sort])

  return (
    <div className="flex min-h-screen flex-col max-[700px]:pb-[72px]">
      <SiteHeader header={header} />
      <main className="flex-1">
        <div className={cn(pageShell, 'pt-6 max-[700px]:pt-4')}>
          <Breadcrumbs
            label={t.breadcrumbLabel}
            items={[
              { label: t.breadcrumbHome, href: '/' },
              { label: t.breadcrumbCurrent },
            ]}
          />
        </div>

        <section className="relative hidden h-[200px] w-full items-center justify-center max-[700px]:flex">
          <Image
            src="/images/neighborhoods-hero.jpg"
            alt=""
            fill
            priority
            className="object-cover"
            sizes="(max-width: 700px) 700px, 1px"
          />
          <div className="relative z-[1] flex h-full w-full flex-col items-center justify-center gap-3 bg-[rgba(28,30,29,0.58)] px-5 text-center">
            <p className="m-0 text-[10px] font-bold uppercase tracking-[0.06em] text-accent">
              {t.mobileHeroEyebrow}
            </p>
            <h1 className="m-0 font-display text-[32px] font-normal leading-none text-surface">
              {t.mobileHeroTitle}
            </h1>
          </div>
        </section>

        <section className={cn(pageShell, 'pb-8 pt-2 max-[700px]:pb-3 max-[700px]:pt-2')}>
          <div className="flex items-end justify-between gap-8 max-[1100px]:flex-col max-[1100px]:items-stretch">
            <div className="flex max-w-[45rem] flex-col gap-4 max-[700px]:gap-3">
              <p className="m-0 hidden text-xs font-bold uppercase tracking-[0.06em] text-accent max-[700px]:hidden">
                {t.eyebrow}
              </p>
              <h1 className="m-0 font-display text-[56px] font-normal leading-[1.1] max-[1100px]:text-[40px] max-[700px]:hidden">
                {t.title}
              </h1>
              <p className="m-0 text-base leading-relaxed text-muted max-[700px]:text-sm">
                <span className="max-[700px]:hidden">{t.lead}</span>
                <span className="hidden max-[700px]:inline">{t.mobileLead}</span>
              </p>
            </div>
            <aside className="w-[340px] shrink-0 rounded-md border border-line bg-surface p-6 shadow-[0_4px_6px_rgba(0,0,0,0.02)] max-[1100px]:w-full max-[700px]:hidden">
              <p className="m-0 font-display text-lg font-semibold text-forest">{t.glanceTitle}</p>
              <div className="mt-3 flex items-start justify-between gap-4 text-[13px]">
                <span className="text-muted">{t.totalDistricts}</span>
                <span className="font-bold text-ink">
                  {t.totalDistrictsValue.replace('{count}', String(initial.neighborhoods.length))}
                </span>
              </div>
              <hr className="my-3 border-0 border-t border-line" />
              <div className="flex items-start justify-between gap-4 text-[13px]">
                <span className="text-muted">{t.highestValuation}</span>
                <span className="font-bold text-ink">{initial.highestValuationName}</span>
              </div>
            </aside>
          </div>
        </section>

        <section className="border-y border-line bg-surface max-[700px]:border-0 max-[700px]:bg-transparent">
          <div
            className={cn(
              pageShell,
              'flex items-center justify-between gap-4 py-4 max-[1100px]:flex-col max-[1100px]:items-stretch max-[700px]:gap-3 max-[700px]:px-0 max-[700px]:py-3',
            )}
          >
            <div className="flex items-center gap-3 overflow-x-auto max-[700px]:px-[var(--page-pad)]">
              <span className="shrink-0 text-[13px] font-bold text-ink max-[700px]:hidden">
                {t.filterLabel}
              </span>
              {lifestyleFilters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={cn(
                    'shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors max-[700px]:px-3.5 max-[700px]:py-1.5 max-[700px]:text-[11px]',
                    filter === item.id
                      ? 'border-forest bg-forest text-surface'
                      : 'border-line bg-surface-soft text-muted hover:border-forest/40',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-3 max-[700px]:w-full max-[700px]:px-[var(--page-pad)]">
              <span className="shrink-0 text-[13px] font-semibold text-ink max-[700px]:hidden">
                {t.sortLabel}
              </span>
              <div className="search-filter-bar__field w-[220px] max-[700px]:w-full">
                <SearchSelect
                  instanceId="neighborhoods-sort"
                  name="sort"
                  options={sortOptions}
                  value={sort}
                  onChange={(value) => {
                    setSort(value === 'name' ? 'name' : 'valuation')
                  }}
                  placeholder={t.sortLabel}
                  isClearable={false}
                  menuPortal
                />
              </div>
            </div>
          </div>
        </section>

        <section className={cn(pageShell, 'py-8 max-[700px]:py-4')}>
          <div className="property-cards-lift grid grid-cols-4 gap-6 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1 max-[700px]:gap-4">
            {items.map((item, index) => (
              <NeighborhoodCard
                key={item.slug}
                item={item}
                exploreLabel={t.explore}
                activeLabel={t.activeCount}
                avgBuy={t.avgBuy}
                avgRent={t.avgRent}
                priority={index < 4}
              />
            ))}
          </div>
        </section>

        <section className={cn(pageShell, 'pb-[100px] pt-[60px] max-[700px]:pb-8 max-[700px]:pt-6')}>
          <div className="mb-8 flex flex-col gap-3 max-[700px]:mb-5 max-[700px]:hidden">
            <p className="m-0 text-xs font-bold uppercase tracking-[0.06em] text-accent">
              {t.guidanceEyebrow}
            </p>
            <h2 className="m-0 font-display text-[32px] font-medium leading-none text-ink">
              {t.guidanceTitle}
            </h2>
          </div>

          <div className="hidden rounded-xl bg-forest p-6 text-surface max-[700px]:block">
            <h2 className="m-0 font-display text-[22px] font-normal leading-tight">
              {t.mobileMatcherTitle}
            </h2>
            <p className="mt-3 m-0 text-sm leading-relaxed text-surface/80">{t.mobileMatcherLead}</p>
            <Link
              href="/matching"
              className={cn(
                btnClass('primary', 'sm'),
                'mt-5 !bg-accent !text-forest hover:!opacity-95',
              )}
            >
              {t.mobileMatcherCta}
            </Link>
          </div>

          <div className="flex items-start gap-8 max-[1100px]:flex-col max-[700px]:hidden">
            <div className="flex w-[500px] shrink-0 flex-col gap-6 self-stretch rounded-md bg-forest p-10 text-surface max-[1100px]:w-full">
              <h3 className="m-0 font-display text-[28px] font-normal leading-[1.2]">
                {t.matcherCardTitle}
              </h3>
              <p className="m-0 text-sm leading-relaxed text-surface/80">{t.matcherCardLead}</p>
              <Link
                href="/matching"
                className="inline-flex w-fit items-center justify-center rounded-sm border-0 bg-accent px-6 py-3 text-[13px] font-bold text-forest no-underline transition-opacity hover:opacity-[0.92]"
              >
                {t.matcherCta}
              </Link>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="grid grid-cols-2 gap-6 max-[1100px]:grid-cols-1">
                <div className="flex flex-col gap-3 rounded-md border border-line bg-surface p-6">
                  <h3 className="m-0 font-display text-lg font-semibold text-ink">{t.canalTitle}</h3>
                  <p className="m-0 text-[13px] leading-relaxed text-muted">{t.canalLead}</p>
                </div>
                <div className="flex flex-col gap-3 rounded-md border border-line bg-surface p-6">
                  <h3 className="m-0 font-display text-lg font-semibold text-ink">{t.modernTitle}</h3>
                  <p className="m-0 text-[13px] leading-relaxed text-muted">{t.modernLead}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-6 rounded-md border border-line bg-surface-muted p-7 max-[1100px]:flex-col max-[1100px]:items-start">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <h3 className="m-0 font-display text-lg font-semibold text-ink">{t.reportTitle}</h3>
                  <p className="m-0 text-[13px] text-muted">{t.reportLead}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5 max-[1100px]:w-full max-[1100px]:items-start">
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="inline-flex cursor-not-allowed items-center justify-center rounded-sm border border-line bg-surface px-4 py-2.5 text-[13px] font-semibold text-muted opacity-60"
                  >
                    {t.reportCta}
                  </button>
                  <p className="m-0 text-[12px] font-medium tracking-wide text-muted">
                    {t.reportSoon}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter footer={footer} settings={settings} />
      <MobileBottomNav />
    </div>
  )
}

function NeighborhoodCard({
  item,
  exploreLabel,
  activeLabel,
  avgBuy,
  avgRent,
  priority = false,
}: {
  item: NeighborhoodGuideCard
  exploreLabel: string
  activeLabel: string
  avgBuy: string
  avgRent: string
  priority?: boolean
}) {
  return (
    <Link
      href={`/neighborhoods/${item.slug}`}
      className="property-card group flex flex-col overflow-hidden rounded-card border border-line bg-surface text-inherit no-underline shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
    >
      <div className="relative h-[180px] w-full overflow-hidden bg-line">
        <Image
          src={item.coverUrl}
          alt={item.coverAlt || item.name}
          fill
          priority={priority}
          unoptimized
          className="object-cover"
          sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 400px"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="m-0 text-[11px] font-bold uppercase tracking-[0.04em] text-accent">{item.vibe}</p>
          <span className="rounded-sm bg-forest/5 px-2 py-1 text-[11px] font-semibold text-forest">
            {activeLabel.replace('{count}', String(item.activeCount))}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="m-0 font-display text-xl font-semibold leading-none">{item.name}</h2>
          <p className="m-0 line-clamp-2 text-[13px] leading-snug text-muted">{item.summary}</p>
        </div>
        <hr className="m-0 border-0 border-t border-line" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="m-0 text-[10px] font-semibold uppercase text-muted">{avgBuy}</p>
            <p className="m-0 text-[13px] font-bold">{item.avgBuy}</p>
          </div>
          <div>
            <p className="m-0 text-[10px] font-semibold uppercase text-muted">{avgRent}</p>
            <p className="m-0 text-[13px] font-bold">{item.avgRent}</p>
          </div>
        </div>
        <span className="mt-auto inline-flex items-center gap-1 pt-1 text-xs font-semibold text-forest">
          {exploreLabel}
          <ArrowRight className="size-3" aria-hidden />
        </span>
      </div>
    </Link>
  )
}
