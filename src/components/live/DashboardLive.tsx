'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { applyLiveGlobal, type CmsDoc } from '@/cms/map'
import type {
  CustomerMessageView,
  DashboardView,
  PropertyView,
  SavedSearchView,
  ViewingItemView,
} from '@/cms/types'
import { isCmsMedia } from '@/cms/utils'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CustomerAccountBadge, SignOutButton } from '@/components/CustomerAccountBadge'
import { DashboardMessagesPanel } from '@/components/DashboardMessagesPanel'
import { DashboardProfileForm } from '@/components/DashboardProfileForm'
import { DashboardSavedSearchesPanel } from '@/components/DashboardSavedSearchesPanel'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { useLiveGlobalEvent } from '@/components/LivePreviewListener'
import { useLocale } from '@/i18n/locale-context'
import type { CustomerSession } from '@/lib/customer-auth'
import type { DashboardSectionId } from '@/lib/dashboard-section'
import { formatPropertyPrice } from '@/lib/format-price'
import { pickNextViewing, propertyAddressLabel } from '@/lib/viewing'
import { btnClass, cn } from '@/lib/ui'

const SIDEBAR = [
  { id: 'overview' as const, href: null },
  { id: 'favorites' as const, href: '/favorites' },
  { id: 'savedSearches' as const, href: null },
  { id: 'viewings' as const, href: '/viewings' },
  { id: 'messages' as const, href: null },
  { id: 'profile' as const, href: null },
]

type DayPeriod = 'morning' | 'day' | 'evening'

function dayPeriod(date = new Date()): DayPeriod {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'day'
  return 'evening'
}

function FavoriteRow({ property, locale }: { property: PropertyView; locale: string }) {
  return (
    <Link
      href={`/properties/${property.slug}`}
      className="flex items-center gap-3 rounded-lg border border-line bg-surface-muted p-3 no-underline transition-colors hover:bg-surface-soft"
    >
      <div className="relative h-14 w-[72px] shrink-0 overflow-hidden rounded">
        {property.coverUrl ? (
          <Image
            src={property.coverUrl}
            alt=""
            fill
            unoptimized={isCmsMedia(property.coverUrl)}
            className="object-cover"
            sizes="72px"
          />
        ) : (
          <div className="h-full w-full bg-line" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-[13px] font-bold text-ink">{property.title}</p>
        <p className="m-0 truncate text-xs text-muted">{property.neighborhood}</p>
        <p className="m-0 pt-0.5 text-xs font-semibold text-forest">
          {formatPropertyPrice(property.price, locale, property.listingType)}
        </p>
      </div>
    </Link>
  )
}

function NextViewingPanel({
  viewing,
  compact = false,
}: {
  viewing: ViewingItemView | null
  compact?: boolean
}) {
  const { messages } = useLocale()
  const t = messages.dashboard.nextViewing

  return (
    <section
      className={cn(
        'flex flex-col border border-line bg-surface',
        compact ? 'gap-4 rounded-xl p-4' : 'gap-5 rounded-[10px] p-7',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          className={cn(
            'm-0 font-display text-ink',
            compact ? 'text-xl font-medium' : 'text-[22px] font-normal',
          )}
        >
          {t.title}
        </h2>
        <Link
          href="/viewings"
          className={cn(
            'shrink-0 font-semibold text-forest no-underline',
            compact ? 'text-xs' : 'text-[13px]',
          )}
        >
          {t.manage}
        </Link>
      </div>

      {!viewing ? (
        <div className="flex flex-col gap-3">
          <p className={cn('m-0 leading-relaxed text-muted', compact ? 'text-[13px]' : 'text-sm')}>
            {t.empty}
          </p>
          <Link
            href="/buy"
            className={cn(
              btnClass('outline', 'sm'),
              'self-start no-underline',
              compact ? 'px-4 py-2 text-xs' : 'px-4 py-2.5 text-[13px]',
            )}
          >
            {t.browse}
          </Link>
        </div>
      ) : (
        <>
          <div className={cn('flex gap-3', compact ? 'items-center' : 'items-start gap-4')}>
            <div
              className={cn(
                'relative shrink-0 overflow-hidden rounded',
                compact ? 'h-[54px] w-[72px]' : 'h-20 w-[100px] rounded-md',
              )}
            >
              {viewing.property.coverUrl ? (
                <Image
                  src={viewing.property.coverUrl}
                  alt=""
                  fill
                  unoptimized={isCmsMedia(viewing.property.coverUrl)}
                  className="object-cover"
                  sizes={compact ? '72px' : '100px'}
                />
              ) : (
                <div className="h-full w-full bg-line" />
              )}
            </div>
            <div className={cn('min-w-0 flex-1', !compact && 'flex flex-col gap-1.5')}>
              <p className={cn('m-0 font-bold text-ink', compact ? 'text-[13px]' : 'text-sm')}>
                {viewing.property.title}
              </p>
              {!compact ? (
                <p className="m-0 text-[13px] text-muted">
                  {propertyAddressLabel(viewing.property.address, viewing.property.neighborhood)}
                </p>
              ) : null}
              <div className={cn('flex items-center gap-2 text-xs', !compact && 'pt-1')}>
                <p className={cn('m-0 font-bold uppercase text-accent', compact && 'normal-case font-semibold')}>
                  {viewing.whenLabel}
                </p>
                {!compact ? (
                  <p className="m-0 text-muted">{viewing.property.neighborhood}</p>
                ) : (
                  <p className="m-0 text-muted">{viewing.property.neighborhood}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 min-[901px]:gap-3">
            <Link
              href={`/properties/${viewing.property.slug}`}
              className={cn(
                btnClass('primary', 'sm'),
                'flex-1 justify-center no-underline',
                compact ? 'py-2 text-xs' : 'py-2.5 text-[13px]',
              )}
            >
              {compact ? t.directions : t.directionsDesktop}
            </Link>
            <Link
              href={`/viewings/book?property=${encodeURIComponent(viewing.property.slug)}`}
              className={cn(
                'flex flex-1 items-center justify-center border border-forest font-semibold text-forest no-underline',
                compact
                  ? 'rounded-md py-2 text-xs font-bold'
                  : 'rounded-md px-4 py-2.5 text-[13px]',
              )}
            >
              {compact ? t.reschedule : t.rescheduleDesktop}
            </Link>
          </div>
        </>
      )}
    </section>
  )
}

export function DashboardLive({
  initial,
  customer,
  initialSection = 'overview',
}: {
  initial: DashboardView
  customer: CustomerSession
  initialSection?: DashboardSectionId
}) {
  const { locale, messages } = useLocale()
  const t = messages.dashboard
  const [section, setSection] = useState<DashboardSectionId>(initialSection)
  const [period, setPeriod] = useState<DayPeriod>('morning')
  const [favorites, setFavorites] = useState(initial.favorites)
  const [viewings, setViewings] = useState(initial.viewings)
  const [inbox, setInbox] = useState<CustomerMessageView[]>(initial.messages)
  const [savedSearches, setSavedSearches] = useState<SavedSearchView[]>(initial.savedSearches)

  useEffect(() => {
    setPeriod(dayPeriod())
  }, [])

  useEffect(() => {
    setSection(initialSection)
  }, [initialSection])

  useEffect(() => {
    setFavorites(initial.favorites)
  }, [initial.favorites])

  useEffect(() => {
    setViewings(initial.viewings)
  }, [initial.viewings])

  useEffect(() => {
    setInbox(initial.messages)
  }, [initial.messages])

  useEffect(() => {
    setSavedSearches(initial.savedSearches)
  }, [initial.savedSearches])

  const greetingName =
    [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.email
  const greeting = t.greeting[period].replace('{name}', greetingName)

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

  const favoritesCount = favorites.length
  const previewFavorites = favorites.slice(0, 3)
  const nextViewing = pickNextViewing(viewings)
  const viewingsCount = viewings.filter((item) => item.status !== 'cancelled').length
  const unreadCount = inbox.filter((item) => !item.read).length

  const metrics: Array<{
    value: string
    label: string
    short: string
    onClick?: () => void
  }> = [
    { value: String(favoritesCount), label: t.metrics.favorites, short: t.metrics.favoritesShort },
    { value: String(viewingsCount), label: t.metrics.viewings, short: t.metrics.viewingsShort },
    {
      value: String(unreadCount),
      label: t.metrics.messages,
      short: t.metrics.messagesShort,
      onClick: () => setSection('messages'),
    },
  ]

  const showProfile = section === 'profile'
  const showMessages = section === 'messages'
  const showSavedSearches = section === 'savedSearches'
  const showOverview = !showProfile && !showMessages && !showSavedSearches

  const crumbs = useMemo(() => {
    if (showProfile) {
      return [
        { label: t.breadcrumbHome, href: '/' },
        { label: t.breadcrumbCabinet, href: '/dashboard' },
        { label: t.nav.profile },
      ]
    }
    if (showMessages) {
      return [
        { label: t.breadcrumbHome, href: '/' },
        { label: t.breadcrumbCabinet, href: '/dashboard' },
        { label: t.nav.messages },
      ]
    }
    if (showSavedSearches) {
      return [
        { label: t.breadcrumbHome, href: '/' },
        { label: t.breadcrumbCabinet, href: '/dashboard' },
        { label: t.nav.savedSearches },
      ]
    }
    return [
      { label: t.breadcrumbHome, href: '/' },
      { label: t.breadcrumbCabinet },
    ]
  }, [showProfile, showMessages, showSavedSearches, t])

  const favoritesBlock = (
    <section className="flex flex-col gap-4 rounded-[10px] border border-line bg-surface p-4 min-[901px]:gap-5 min-[901px]:p-7">
      <div className="flex items-center justify-between gap-3">
        <h2 className="m-0 font-display text-xl font-medium text-ink min-[901px]:text-[22px] min-[901px]:font-normal">
          {t.favoritesSection.title}
        </h2>
        <Link href="/favorites" className="shrink-0 text-xs font-semibold text-forest no-underline min-[901px]:text-[13px]">
          {t.favoritesSection.manage}
        </Link>
      </div>
      {previewFavorites.length === 0 ? (
        <div className="flex flex-col gap-3">
          <p className="m-0 text-[13px] leading-relaxed text-muted">{t.favoritesSection.empty}</p>
          <Link
            href="/buy"
            className={cn(btnClass('outline', 'sm'), 'self-start px-4 py-2 text-xs no-underline')}
          >
            {t.favoritesSection.browse}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {previewFavorites.map((property) => (
            <FavoriteRow key={property.id || property.slug} property={property} locale={locale} />
          ))}
        </div>
      )}
    </section>
  )

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-r from-[#f7f3eb] to-[#efe7da] max-[700px]:pb-[72px]">
      <SiteHeader header={header} />

      {/* —— Mobile —— */}
      <main className="flex flex-1 flex-col min-[901px]:hidden">
        <div className="px-5 pt-5">
          <Breadcrumbs items={crumbs} label={t.breadcrumbLabel} className="mb-3" />
        </div>
        {showProfile ? (
          <div className="px-5 pb-10">
            <DashboardProfileForm customer={customer} />
          </div>
        ) : showMessages ? (
          <div className="px-5 pb-10">
            <DashboardMessagesPanel initial={inbox} onChange={setInbox} />
          </div>
        ) : showSavedSearches ? (
          <div className="px-5 pb-10">
            <DashboardSavedSearchesPanel initial={savedSearches} />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 px-5 pb-4">
              <CustomerAccountBadge customer={customer} photoOnly size="lg" className="self-start" />
              <div className="flex flex-col gap-1">
                <h1 className="m-0 font-display text-[28px] font-normal leading-none text-ink">
                  {greeting}
                </h1>
                <p className="m-0 text-[13px] text-muted">{t.leadMobile}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setSection('messages')}
                  className="border-0 bg-transparent p-0 text-[13px] font-semibold text-forest"
                >
                  {t.nav.messages}
                  {unreadCount > 0 ? ` (${unreadCount})` : ''}
                </button>
                <button
                  type="button"
                  onClick={() => setSection('profile')}
                  className="border-0 bg-transparent p-0 text-[13px] font-semibold text-forest"
                >
                  {t.nav.profile}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 px-5 pb-6">
              {metrics.map((item) => (
                <button
                  key={item.short}
                  type="button"
                  disabled={!item.onClick}
                  onClick={item.onClick}
                  className={cn(
                    'flex flex-col gap-1 rounded-lg border border-line bg-surface p-4 text-left',
                    item.onClick ? 'cursor-pointer' : 'cursor-default',
                  )}
                >
                  <p className="m-0 text-2xl font-bold text-ink">{item.value}</p>
                  <p className="m-0 text-xs text-muted">{item.short}</p>
                </button>
              ))}
            </div>

            <div className="px-5 pb-6">{favoritesBlock}</div>

            <div className="px-5 pb-6">
              <NextViewingPanel viewing={nextViewing} compact />
            </div>

            <div className="flex justify-end px-5 pb-10">
              <SignOutButton />
            </div>
          </>
        )}
      </main>

      {/* —— Desktop —— */}
      <div className="mx-auto hidden w-full max-w-page flex-1 min-[901px]:flex">
        <aside className="flex w-[260px] shrink-0 flex-col gap-3 border-r border-line bg-surface p-8">
          {SIDEBAR.map((item) => {
            const active = section === item.id
            const className = cn(
              'rounded-md px-4 py-3 text-left text-sm no-underline transition-colors',
              active
                ? 'bg-[#e8efea] font-bold text-forest'
                : 'bg-surface font-medium text-muted hover:bg-surface-soft',
            )
            const label =
              item.id === 'messages' && unreadCount > 0
                ? `${t.nav[item.id]} (${unreadCount})`
                : t.nav[item.id]
            if (item.href) {
              return (
                <Link key={item.id} href={item.href} className={className}>
                  {label}
                </Link>
              )
            }
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={cn(className, 'border-0')}
              >
                {label}
              </button>
            )
          })}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6 p-12">
          <Breadcrumbs items={crumbs} label={t.breadcrumbLabel} className="mb-0" />
          {showProfile ? (
            <DashboardProfileForm customer={customer} />
          ) : showMessages ? (
            <DashboardMessagesPanel initial={inbox} onChange={setInbox} />
          ) : showSavedSearches ? (
            <DashboardSavedSearchesPanel initial={savedSearches} />
          ) : showOverview ? (
            <div className="flex min-h-0 flex-1 flex-col gap-8">
              <div className="flex items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                  <h1 className="m-0 font-display text-[36px] font-normal leading-none text-ink">
                    {greeting}
                  </h1>
                  <p className="m-0 text-sm text-muted">{t.lead}</p>
                </div>
                <CustomerAccountBadge customer={customer} photoOnly size="lg" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {metrics.map((item) =>
                  item.onClick ? (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.onClick}
                      className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-6 text-left transition-colors hover:bg-surface-soft"
                    >
                      <p className="m-0 text-[32px] font-bold leading-none text-ink">{item.value}</p>
                      <p className="m-0 text-[13px] text-muted">{item.label}</p>
                    </button>
                  ) : (
                    <div
                      key={item.label}
                      className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-6"
                    >
                      <p className="m-0 text-[32px] font-bold leading-none text-ink">{item.value}</p>
                      <p className="m-0 text-[13px] text-muted">{item.label}</p>
                    </div>
                  ),
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <NextViewingPanel viewing={nextViewing} />
                {favoritesBlock}
              </div>

              <div className="mt-auto flex justify-end pt-4">
                <SignOutButton />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="hidden min-[901px]:block">
        <SiteFooter footer={footer} settings={settings} />
      </div>
      <MobileBottomNav />
    </div>
  )
}
