'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo } from 'react'

import { applyLiveGlobal, type CmsDoc } from '@/cms/map'
import type { ViewingItemView, ViewingsView } from '@/cms/types'
import { isCmsMedia } from '@/cms/utils'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { useLiveGlobalEvent } from '@/components/LivePreviewListener'
import { useLocale } from '@/i18n/locale-context'
import { formatPropertyPrice } from '@/lib/format-price'
import { propertyAddressLabel } from '@/lib/viewing'
import { btnClass, cn, pageShell } from '@/lib/ui'

function ViewingCard({ item, locale }: { item: ViewingItemView; locale: string }) {
  const { messages } = useLocale()
  const t = messages.viewings
  const cover = item.property.coverUrl
  const statusLabel =
    item.status === 'new'
      ? t.statusNew
      : item.status === 'cancelled'
        ? t.statusCancelled
        : t.statusConfirmed

  return (
    <article className="flex flex-col overflow-hidden rounded-[12px] border border-line bg-surface shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
      <Link href={`/properties/${item.property.slug}`} className="relative block h-44 no-underline">
        {cover ? (
          <Image
            src={cover}
            alt={item.property.coverAlt || item.property.title}
            fill
            unoptimized={isCmsMedia(cover)}
            className="object-cover"
            sizes="(max-width: 700px) 100vw, 420px"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#e7e1d7] to-[#d9d0c3]" />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="m-0 text-[11px] font-bold uppercase tracking-[0.04em] text-accent">
              {item.property.neighborhood}
            </p>
            <h2 className="m-0 mt-1 truncate font-display text-xl font-semibold text-ink">
              {item.property.title}
            </h2>
          </div>
          <span className="shrink-0 rounded px-2 py-1 text-[10px] font-bold bg-[#e8efea] text-forest">
            {statusLabel}
          </span>
        </div>
        <p className="m-0 text-sm font-semibold text-ink">{item.whenLabel}</p>
        <p className="m-0 text-xs text-muted">
          {propertyAddressLabel(item.property.address, item.property.neighborhood)}
        </p>
        <p className="m-0 text-sm font-bold text-forest">
          {formatPropertyPrice(item.property.price, locale, item.property.listingType)}
        </p>
        <div className="mt-auto flex gap-2 pt-1">
          <Link
            href={`/properties/${item.property.slug}`}
            className={cn(btnClass('primary', 'sm'), 'flex-1 justify-center py-2.5 text-[13px] no-underline')}
          >
            {t.openProperty}
          </Link>
          <Link
            href={`/viewings/book?property=${encodeURIComponent(item.property.slug)}`}
            className="flex flex-1 items-center justify-center rounded-sm border border-forest px-3 py-2.5 text-[13px] font-semibold text-forest no-underline"
          >
            {t.reschedule}
          </Link>
        </div>
      </div>
    </article>
  )
}

export function ViewingsLive({ initial }: { initial: ViewingsView }) {
  const { locale, messages } = useLocale()
  const t = messages.viewings

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

  const items = initial.items
  const empty = items.length === 0
  const crumbs = useMemo(
    () => [
      { label: t.breadcrumbHome, href: '/' },
      { label: messages.dashboard.breadcrumbCabinet, href: '/dashboard' },
      { label: t.title },
    ],
    [t, messages.dashboard.breadcrumbCabinet],
  )

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#f7f3eb] via-[#f3eee4] to-[#efe7da] max-[700px]:pb-[72px]">
      <SiteHeader header={header} />

      <main className={cn(pageShell, 'flex flex-1 flex-col gap-8 py-10 min-[901px]:gap-10 min-[901px]:py-14')}>
        <Breadcrumbs items={crumbs} label={t.breadcrumbLabel} className="mb-0" />

        <header className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <p className="m-0 text-[11px] font-bold uppercase tracking-[0.14em] text-accent">{t.eyebrow}</p>
          <h1 className="m-0 font-display text-[34px] font-normal leading-none text-ink min-[901px]:text-[48px]">
            {t.title}
          </h1>
          <p className="m-0 text-[15px] leading-relaxed text-muted min-[901px]:text-base">{t.lead}</p>
        </header>

        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center py-6">
            <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-[14px] border border-line bg-surface/80 px-6 py-10 text-center">
              <p className="m-0 text-sm leading-relaxed text-muted">{t.empty}</p>
              <Link href="/buy" className={cn(btnClass('primary', 'sm'), 'px-6 py-3 text-sm')}>
                {t.browse}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 min-[700px]:grid-cols-2 min-[1100px]:grid-cols-3">
            {items.map((item) => (
              <ViewingCard key={item.id} item={item} locale={locale} />
            ))}
          </div>
        )}
      </main>

      <div className="hidden min-[901px]:block">
        <SiteFooter footer={footer} settings={settings} />
      </div>
      <MobileBottomNav />
    </div>
  )
}
