'use client'

import Link from 'next/link'
import { useMemo } from 'react'

import { applyLiveGlobal, type CmsDoc } from '@/cms/map'
import type { FavoritesView } from '@/cms/types'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { PropertyCard } from '@/components/PropertyCard'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { useLiveGlobalEvent } from '@/components/LivePreviewListener'
import { useLocale } from '@/i18n/locale-context'
import { btnClass, cn, pageShell } from '@/lib/ui'

export function FavoritesLive({ initial }: { initial: FavoritesView }) {
  const { locale, messages } = useLocale()
  const t = messages.favorites

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

  const properties = initial.properties
  const empty = properties.length === 0
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
          <div className="grid grid-cols-1 gap-5 min-[640px]:grid-cols-2 min-[1100px]:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard
                key={property.id || property.slug}
                property={property}
                locale={locale}
                bedroomsOne={messages.home.bedroomsLabelOne}
                bedroomsMany={messages.home.bedroomsLabel}
              />
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
