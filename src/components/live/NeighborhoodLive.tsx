'use client'

import Image from 'next/image'
import { useState } from 'react'

import { applyLiveGlobal, type CmsDoc } from '@/cms/map'
import type { NeighborhoodDetailPageView } from '@/cms/types'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { PropertyCard } from '@/components/PropertyCard'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { useLiveGlobalEvent } from '@/components/LivePreviewListener'
import { useLocale } from '@/i18n/locale-context'
import { cn, pageShell } from '@/lib/ui'

export function NeighborhoodLive({ initial }: { initial: NeighborhoodDetailPageView }) {
  const { locale, messages } = useLocale()
  const t = messages.neighborhoods
  const home = messages.home
  const neighborhood = initial.neighborhood

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

  const [openSections, setOpenSections] = useState<Record<number, boolean>>({ 0: true })

  return (
    <div className="flex min-h-screen flex-col max-[700px]:pb-[72px]">
      <SiteHeader header={header} />
      <main className="flex-1">
        <div className={cn(pageShell, 'pt-6 max-[700px]:pt-4')}>
          <Breadcrumbs
            label={t.breadcrumbLabel}
            items={[
              { label: t.breadcrumbHome, href: '/' },
              { label: t.breadcrumbCurrent, href: '/neighborhoods' },
              { label: neighborhood.name },
            ]}
          />
        </div>

        <section className="relative flex h-[400px] items-center justify-center max-[700px]:h-[180px]">
          <Image
            src={neighborhood.heroUrl}
            alt={neighborhood.heroAlt || neighborhood.name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="relative z-[1] flex h-full w-full flex-col items-center justify-center gap-3 bg-[rgba(28,30,29,0.6)] px-5 text-center">
            <p className="m-0 text-xs font-bold uppercase tracking-[0.06em] text-accent max-[700px]:text-[10px]">
              {t.detailEyebrow}
            </p>
            <h1 className="m-0 font-display text-[56px] font-normal leading-none text-surface max-[700px]:text-[32px]">
              {neighborhood.name}
            </h1>
          </div>
        </section>

        <section
          className={cn(
            pageShell,
            'grid grid-cols-[400px_minmax(0,1fr)] gap-12 py-16 max-[1100px]:grid-cols-1 max-[1100px]:gap-8 max-[700px]:gap-5 max-[700px]:py-5',
          )}
        >
          <aside className="flex flex-col gap-8 max-[700px]:gap-4">
            <div className="rounded-md border border-line bg-surface p-7 max-[700px]:rounded-xl max-[700px]:p-4">
              <p className="m-0 font-display text-[22px] font-normal max-[700px]:text-lg max-[700px]:font-medium">
                {t.districtStats}
              </p>
              <div className="mt-5 flex flex-col gap-3 max-[700px]:mt-3 max-[700px]:gap-2">
                {neighborhood.stats.map((stat, index) => (
                  <div key={`${stat.label}-${index}`}>
                    {index > 0 ? <hr className="mb-3 border-0 border-t border-line max-[700px]:mb-2" /> : null}
                    <div className="flex items-start justify-between gap-4 text-[13px]">
                      <span className="text-muted">{stat.label}</span>
                      <span className="font-bold text-ink">{stat.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 max-[700px]:hidden">
              <p className="m-0 text-xs font-bold uppercase tracking-[0.04em] text-muted">{t.transitTitle}</p>
              {neighborhood.transit.map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 text-[13px] text-ink">
                  <Image
                    src={
                      item.icon === 'bike'
                        ? '/images/icon-location-bike.svg'
                        : '/images/icon-location-transit.svg'
                    }
                    alt=""
                    width={22}
                    height={22}
                    className="size-[22px] shrink-0"
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </aside>

          <div className="flex flex-col gap-10 max-[700px]:gap-5">
            <div className="flex flex-col gap-4 max-[700px]:gap-2">
              <h2 className="m-0 font-display text-[32px] font-normal max-[700px]:text-[22px] max-[700px]:font-medium">
                {neighborhood.headline}
              </h2>
              <p className="m-0 max-w-[42rem] text-base leading-relaxed text-muted max-[700px]:text-sm">
                {neighborhood.body}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {neighborhood.sections.map((section, index) => {
                const open = Boolean(openSections[index])
                return (
                  <div
                    key={section.title}
                    className="rounded-sm border border-line bg-surface p-5 max-[700px]:rounded-md max-[700px]:p-3"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 border-0 bg-transparent p-0 text-left"
                      onClick={() =>
                        setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }))
                      }
                      aria-expanded={open}
                    >
                      <span className="text-[15px] font-bold leading-snug text-ink max-[700px]:text-[13px]">
                        {section.title}
                      </span>
                      <span
                        className={cn(
                          'inline-flex size-8 shrink-0 items-center justify-center text-muted transition-transform duration-300 ease-out',
                          open && 'rotate-45',
                        )}
                        aria-hidden
                      >
                        <svg viewBox="0 0 24 24" className="size-6" fill="none">
                          <path
                            d="M12 5v14M5 12h14"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                    </button>
                    <div
                      className={cn(
                        'grid transition-[grid-template-rows] duration-300 ease-out',
                        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                      )}
                    >
                      <div className="overflow-hidden">
                        <p
                          className={cn(
                            'm-0 text-[13px] leading-relaxed text-muted transition-opacity duration-300 ease-out',
                            open ? 'mt-2 opacity-100' : 'mt-0 opacity-0',
                          )}
                        >
                          {section.body}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {initial.properties.length > 0 ? (
              <section className="flex flex-col gap-5">
                <h2 className="m-0 font-display text-[28px] font-normal max-[700px]:text-xl max-[700px]:font-medium">
                  <span className="max-[700px]:hidden">
                    {t.homesTitle.replace('{name}', neighborhood.name)}
                  </span>
                  <span className="hidden max-[700px]:inline">{t.homesTitleMobile}</span>
                </h2>
                <div className="property-cards-lift grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
                  {initial.properties.map((property) => (
                    <PropertyCard
                      key={property.id || property.slug}
                      property={property}
                      locale={locale}
                      bedroomsOne={home.bedroomsLabelOne}
                      bedroomsMany={home.bedroomsLabel}
                      compact
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </section>
      </main>
      <SiteFooter footer={footer} settings={settings} />
      <MobileBottomNav />
    </div>
  )
}
