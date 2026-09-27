'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

import { applyLiveGlobal, mapProperty, type CmsDoc } from '@/cms/map'
import type { PropertyFilters, SearchView } from '@/cms/types'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { PropertyCard } from '@/components/PropertyCard'
import { SearchSelect } from '@/components/SearchSelect'
import type { SelectOption } from '@/components/searchSelectStyles'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { useCompare } from '@/components/CompareProvider'
import { useLiveCollectionList, useLiveGlobalEvent } from '@/components/LivePreviewListener'
import { useLocale } from '@/i18n/locale-context'
import { btnClass, cn, pageShell } from '@/lib/ui'
import { formatCompactPrice } from '@/lib/format-price'
import { searchHref, withoutFilterValue } from '@/lib/search-params'

const SearchMap = dynamic(
  () => import('@/components/SearchMap').then((mod) => mod.SearchMap),
  {
    ssr: false,
    loading: () => <aside className="search-map search-map--loading" aria-hidden />,
  },
)

function useDesktopMap() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1101px)')
    const update = () => setShow(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return show
}

function FilterChip({
  label,
  href,
  accent,
  pill,
}: {
  label: string
  href: string
  accent?: boolean
  pill?: boolean
}) {
  return (
    <Link
      href={href}
      className={`search-chip${pill ? ' search-chip--pill' : ''}${accent ? ' is-accent' : ''}`}
    >
      {label}
      <span aria-hidden>×</span>
    </Link>
  )
}

export function SearchLive({
  initial,
  basePath,
}: {
  initial: SearchView
  basePath: '/buy' | '/rent'
}) {
  const router = useRouter()
  const { locale, messages } = useLocale()
  const t = messages.search
  const compare = useCompare()
  const showDesktopMap = useDesktopMap()
  const [activeSlug, setActiveSlug] = useState('')
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list')
  const [sheetOpen, setSheetOpen] = useState(true)
  const [sheetDragY, setSheetDragY] = useState(0)
  const [sheetDragging, setSheetDragging] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    pointerId: number
    startY: number
    startOffset: number
    maxHide: number
    currentY: number
  } | null>(null)

  const liveProperties = useLiveCollectionList(
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

  const filters = initial.filters
  const properties = liveProperties.length > 0 ? liveProperties : initial.properties
  const active = properties.find((p) => p.slug === activeSlug) || null
  const count = initial.total || properties.length

  const title =
    filters.propertyType?.length === 1
      ? t.titleType.replace(
          '{type}',
          t.propertyTypes[filters.propertyType[0] as keyof typeof t.propertyTypes] ||
            filters.propertyType[0],
        )
      : basePath === '/rent'
        ? t.titleRent
        : t.titleBuy

  const priceOptions: SelectOption[] =
    basePath === '/rent'
      ? [
          { value: '2000', label: '€2,000' },
          { value: '3000', label: '€3,000' },
          { value: '4000', label: '€4,000' },
          { value: '5000', label: '€5,000' },
          { value: '7500', label: '€7,500' },
        ]
      : [
          { value: '500000', label: '€500,000' },
          { value: '750000', label: '€750,000' },
          { value: '1000000', label: '€1,000,000' },
          { value: '1500000', label: '€1,500,000' },
          { value: '2000000', label: '€2,000,000' },
        ]

  const neighborhoodOptions = initial.neighborhoods.map((item) => ({
    value: item.slug,
    label: item.name,
  }))

  const typeOptions = (Object.keys(t.propertyTypes) as Array<keyof typeof t.propertyTypes>).map(
    (key) => ({
      value: key,
      label: t.propertyTypes[key],
    }),
  )

  const bedsOptions: SelectOption[] = [
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' },
  ]

  const sortOptions: SelectOption[] = [
    { value: 'price', label: t.sortPriceAsc },
    { value: '-price', label: t.sortPriceDesc },
  ]

  function patchFilters(patch: Partial<PropertyFilters>) {
    router.replace(searchHref(basePath, filters, patch), { scroll: false })
  }

  const activeChips: Array<{ key: string; label: string; href: string; accent?: boolean }> = []

  for (const slug of filters.neighborhood || []) {
    activeChips.push({
      key: `neighborhood-${slug}`,
      label: initial.neighborhoods.find((n) => n.slug === slug)?.name || slug,
      href: searchHref(basePath, filters, withoutFilterValue(filters, 'neighborhood', slug)),
    })
  }

  for (const price of filters.maxPrice || []) {
    activeChips.push({
      key: `maxPrice-${price}`,
      label: t.chipMaxPrice.replace(
        '{price}',
        formatCompactPrice(price, locale, filters.listingType || 'buy'),
      ),
      href: searchHref(basePath, filters, {
        ...withoutFilterValue(filters, 'maxPrice', price),
        minPrice: undefined,
      }),
    })
  }

  for (const beds of filters.bedrooms || []) {
    activeChips.push({
      key: `bedrooms-${beds}`,
      label: t.chipBeds.replace('{count}', String(beds)),
      href: searchHref(basePath, filters, withoutFilterValue(filters, 'bedrooms', beds)),
    })
  }

  for (const type of filters.propertyType || []) {
    activeChips.push({
      key: `propertyType-${type}`,
      label: t.chipType.replace(
        '{type}',
        t.propertyTypes[type as keyof typeof t.propertyTypes] || type,
      ),
      href: searchHref(basePath, filters, withoutFilterValue(filters, 'propertyType', type)),
      accent: true,
    })
  }

  const hasAnyFilter = activeChips.length > 0

  function onMultiStrings(key: 'neighborhood' | 'propertyType', next: string | string[]) {
    const list = Array.isArray(next) ? next.filter(Boolean) : next ? [next] : []
    patchFilters({ [key]: list.length ? list : undefined })
  }

  function onMultiNumbers(key: 'bedrooms' | 'maxPrice', next: string | string[]) {
    const list = (Array.isArray(next) ? next : next ? [next] : [])
      .map((item) => Number.parseInt(item, 10))
      .filter((n) => Number.isFinite(n) && n > 0)
    patchFilters({
      [key]: list.length ? list : undefined,
      ...(key === 'maxPrice' ? { minPrice: undefined } : {}),
    })
  }

  function filterControls(prefix: string) {
    return (
      <>
        <div className="search-filter-bar__field">
          <SearchSelect
            instanceId={`${prefix}-neighborhood`}
            name="neighborhood"
            options={neighborhoodOptions}
            value={filters.neighborhood || []}
            onChange={(value) => onMultiStrings('neighborhood', value)}
            placeholder={t.filterLocation}
            isMulti
            menuPortal
          />
        </div>
        <div className="search-filter-bar__field">
          <SearchSelect
            instanceId={`${prefix}-max-price`}
            name="maxPrice"
            options={priceOptions}
            value={(filters.maxPrice || []).map(String)}
            onChange={(value) => onMultiNumbers('maxPrice', value)}
            placeholder={t.filterAnyPrice}
            isMulti
            menuPortal
          />
        </div>
        <div className="search-filter-bar__field search-filter-bar__field--narrow">
          <SearchSelect
            instanceId={`${prefix}-beds`}
            name="beds"
            options={bedsOptions}
            value={(filters.bedrooms || []).map(String)}
            onChange={(value) => onMultiNumbers('bedrooms', value)}
            placeholder={t.filterBeds}
            isMulti
            menuPortal
          />
        </div>
        <div className="search-filter-bar__field">
          <SearchSelect
            instanceId={`${prefix}-type`}
            name="type"
            options={typeOptions}
            value={filters.propertyType || []}
            onChange={(value) => onMultiStrings('propertyType', value)}
            placeholder={messages.home.search.typeValue}
            isMulti
            menuPortal
          />
        </div>
      </>
    )
  }

  function chipsRow(pill?: boolean) {
    if (!hasAnyFilter) return null
    return (
      <>
        {activeChips.map((chip) => (
          <FilterChip
            key={chip.key}
            label={chip.label}
            href={chip.href}
            accent={chip.accent}
            pill={pill}
          />
        ))}
        <Link href={basePath} className="search-toolbar__clear">
          {t.clearAll}
        </Link>
      </>
    )
  }

  function collapsedOffset() {
    const content = sheetRef.current?.querySelector(
      '.search-filter-sheet__content',
    ) as HTMLElement | null
    if (!content) return 128
    return Math.max(content.scrollHeight + 4, 0)
  }

  function onSheetPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    if (!sheetRef.current) return
    const maxHide = collapsedOffset()
    const startOffset = sheetOpen ? 0 : maxHide
    dragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startOffset,
      maxHide,
      currentY: startOffset,
    }
    setSheetDragging(true)
    setSheetDragY(startOffset)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function onSheetPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const delta = event.clientY - drag.startY
    const next = Math.min(drag.maxHide, Math.max(0, drag.startOffset + delta))
    drag.currentY = next
    setSheetDragY(next)
  }

  function endSheetDrag(pointerId: number) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== pointerId) return
    const open = drag.currentY < drag.maxHide * 0.45
    setSheetOpen(open)
    setSheetDragY(0)
    setSheetDragging(false)
    dragRef.current = null
  }

  const showMobileMap = !showDesktopMap && mobileView === 'map'
  const sheetStyle = sheetDragging
    ? ({
        transform: `translateY(${sheetDragY}px)`,
        transition: 'none',
      } as const)
    : undefined

  return (
    <div
      className={cn(
        'page-search flex min-h-screen flex-col max-[700px]:pb-[72px]',
        showMobileMap && 'page-search--mobile-map',
        !showMobileMap && sheetOpen && 'page-search--sheet-open',
      )}
    >
      <SiteHeader header={header} />
      <main>
        <div className="search-filter-bar search-filter-bar--desktop">
          <div className={cn('search-filter-bar__inner', pageShell)}>
            <div className="search-filter-bar__sort">
              <div className="search-filter-bar__sort-select">
                <SearchSelect
                  instanceId="bar-sort"
                  name="sort"
                  options={sortOptions}
                  value={filters.sort === 'price' || filters.sort === '-price' ? filters.sort : ''}
                  onChange={(value) => {
                    patchFilters({
                      sort: value === 'price' || value === '-price' ? value : 'order',
                    })
                  }}
                  placeholder={t.sortBy}
                  isClearable
                />
              </div>
            </div>
            <div className="search-filter-bar__controls">{filterControls('bar')}</div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="flex flex-col items-stretch gap-1">
                {compare.canCompare ? (
                  <Link
                    href={compare.href}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-sm border-0 bg-[#e8efea] px-4 py-2.5 text-[13px] font-semibold text-forest no-underline transition-colors hover:bg-[#dce8e0]"
                  >
                    {t.compareWithCount.replace('{count}', String(compare.count))}
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex cursor-not-allowed items-center justify-center whitespace-nowrap rounded-sm border-0 bg-[#e8efea] px-4 py-2.5 text-[13px] font-semibold text-forest opacity-45"
                    title={t.compareNeedMore}
                  >
                    {t.compareNeedMore}
                  </button>
                )}
                {compare.count > 0 ? (
                  <button
                    type="button"
                    onClick={() => compare.clear()}
                    className="border-0 bg-transparent p-0 text-center text-[11px] font-semibold text-muted underline decoration-muted/40 underline-offset-2 transition-colors hover:text-forest"
                  >
                    {t.compareClear}
                  </button>
                ) : null}
              </div>
              <Link
                href="/matching"
                className={cn(
                  btnClass('outline', 'sm'),
                  'search-filter-bar__smart self-start whitespace-nowrap !px-4 !py-2.5 text-[13px] font-semibold no-underline shadow-none',
                )}
              >
                {t.smartMatch}
              </Link>
            </div>
            {hasAnyFilter ? (
              <div className="search-filter-bar__chips">{chipsRow()}</div>
            ) : null}
          </div>
        </div>

        <div className={cn('search-intro search-intro--desktop', pageShell)}>
          <h1>{title}</h1>
          <p>{t.count.replace('{count}', String(count))}</p>
        </div>

        <div className="search-mobile-intro">
          <div className="search-mobile-intro__top">
            <div>
              <h1>{title}</h1>
              <p>{t.countCity.replace('{count}', String(count))}</p>
            </div>
            <div className="search-view-toggle" role="tablist" aria-label={t.viewToggle}>
              <button
                type="button"
                role="tab"
                aria-selected={mobileView === 'list'}
                className={mobileView === 'list' ? 'is-active' : undefined}
                onClick={() => setMobileView('list')}
              >
                {t.viewList}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mobileView === 'map'}
                className={mobileView === 'map' ? 'is-active' : undefined}
                onClick={() => setMobileView('map')}
              >
                {t.viewMap}
              </button>
            </div>
          </div>
          {hasAnyFilter ? <div className="search-chips-scroll">{chipsRow(true)}</div> : null}
        </div>

        {showMobileMap ? (
          <div className="search-mobile-map">
            <SearchMap
              properties={properties}
              activeSlug={active?.slug || ''}
              onSelect={setActiveSlug}
              locale={locale}
              bedroomsOne={messages.home.bedroomsLabelOne}
              bedroomsMany={messages.home.bedroomsLabel}
              mapLabel={t.mapLabel}
            />
          </div>
        ) : (
          <div className={cn('search-split', pageShell)}>
            <div className="search-results">
              {properties.length === 0 ? (
                <p className="search-empty">{t.empty}</p>
              ) : (
                properties.map((property) => (
                  <div
                    key={property.id || property.slug || `property-${property.title}`}
                    className={`search-results__item${active?.slug === property.slug ? ' is-active' : ''}`}
                  >
                    <PropertyCard
                      property={property}
                      locale={locale}
                      bedroomsOne={messages.home.bedroomsLabelOne}
                      bedroomsMany={messages.home.bedroomsLabel}
                      variant="grid"
                      showCompare
                      mapActive={active?.slug === property.slug}
                      onShowOnMap={() => {
                        setActiveSlug(property.slug)
                        if (!showDesktopMap) setMobileView('map')
                      }}
                    />
                  </div>
                ))
              )}
            </div>

            {showDesktopMap ? (
              <SearchMap
                properties={properties}
                activeSlug={active?.slug || ''}
                onSelect={setActiveSlug}
                locale={locale}
                bedroomsOne={messages.home.bedroomsLabelOne}
                bedroomsMany={messages.home.bedroomsLabel}
                mapLabel={t.mapLabel}
              />
            ) : null}
          </div>
        )}

        <div
          ref={sheetRef}
          className={`search-filter-sheet${showMobileMap ? ' is-hidden' : ''}${
            sheetOpen || sheetDragging ? '' : ' is-collapsed'
          }${sheetDragging ? ' is-dragging' : ''}`}
          style={sheetStyle}
        >
          <div
            className="search-filter-sheet__grab"
            onPointerDown={onSheetPointerDown}
            onPointerMove={onSheetPointerMove}
            onPointerUp={(event) => endSheetDrag(event.pointerId)}
            onPointerCancel={(event) => endSheetDrag(event.pointerId)}
          >
            <div className="search-filter-sheet__handle" aria-hidden />
            <div className="search-filter-sheet__head">
              <p>{t.filtersTitle}</p>
              {hasAnyFilter ? (
                <Link
                  href={basePath}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => event.stopPropagation()}
                >
                  {t.clearAll}
                </Link>
              ) : (
                <span />
              )}
            </div>
          </div>
          <div className="search-filter-sheet__content">
            <div className="search-filter-sheet__stack search-filter-sheet__stack--selects">
              <div className="search-filter-bar__field">
                <SearchSelect
                  instanceId="sheet-sort"
                  name="sort"
                  options={sortOptions}
                  value={filters.sort === 'price' || filters.sort === '-price' ? filters.sort : ''}
                  onChange={(value) => {
                    patchFilters({
                      sort: value === 'price' || value === '-price' ? value : 'order',
                    })
                  }}
                  placeholder={t.sortBy}
                  isClearable
                  menuPortal
                />
              </div>
              {filterControls('sheet')}
            </div>
            {compare.canCompare ? (
              <Link
                href={compare.href}
                className="mt-1 flex shrink-0 items-center justify-center rounded-sm border-0 bg-[#e8efea] px-4 py-3.5 text-center text-[13px] font-semibold text-forest no-underline transition-colors hover:bg-[#dce8e0]"
                onPointerDown={(event) => event.stopPropagation()}
              >
                {t.compareWithCount.replace('{count}', String(compare.count))}
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="mt-1 flex cursor-not-allowed items-center justify-center rounded-sm border-0 bg-[#e8efea] px-4 py-3.5 text-center text-[13px] font-semibold text-forest opacity-45"
              >
                {t.compareNeedMore}
              </button>
            )}
            {compare.count > 0 ? (
              <button
                type="button"
                onClick={() => compare.clear()}
                onPointerDown={(event) => event.stopPropagation()}
                className="mt-0.5 border-0 bg-transparent p-0 text-center text-[12px] font-semibold text-muted underline decoration-muted/40 underline-offset-2"
              >
                {t.compareClear}
              </button>
            ) : null}
            <Link
              href="/matching"
              className={cn(
                btnClass('outline', 'block'),
                'mt-1 shrink-0 text-center text-[13px] font-semibold no-underline shadow-none',
              )}
              onPointerDown={(event) => event.stopPropagation()}
            >
              {t.smartMatch}
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter footer={footer} settings={settings} />
      <MobileBottomNav />
    </div>
  )
}
