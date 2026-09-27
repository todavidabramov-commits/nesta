'use client'

import Image from 'next/image'
import { useState, type FormEvent } from 'react'

import { applyLiveGlobal, mapAgent, mapProperty, type CmsDoc } from '@/cms/map'
import type { AgentDetailView, PropertyView } from '@/cms/types'
import { isCmsMedia } from '@/cms/utils'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { FieldError, FieldLabel, fieldClassName } from '@/components/forms/FieldError'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { PropertyCard } from '@/components/PropertyCard'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import {
  useLiveCollection,
  useLiveCollectionList,
  useLiveGlobalEvent,
} from '@/components/LivePreviewListener'
import { useFormValidation } from '@/hooks/useFormValidation'
import { useLocale } from '@/i18n/locale-context'
import { btnClass, cn } from '@/lib/ui'
import { inquireSchema, validationMessage } from '@/lib/validation'

export function AgentLive({
  initial,
  fromProperty = null,
  fromViewing = false,
}: {
  initial: AgentDetailView
  fromProperty?: PropertyView | null
  fromViewing?: boolean
}) {
  const { locale, messages } = useLocale()
  const t = messages.agent
  const propertyT = messages.property
  const viewingT = messages.bookViewing
  const home = messages.home

  const agent = useLiveCollection('agents', initial.agent, (doc, prev) => mapAgent(doc, prev))
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

  const firstName = agent.name.trim().split(/\s+/)[0] || agent.name
  const ratingLabel = `★ ${agent.rating.toFixed(1)} / 5.0`
  const soldLabel = t.homes.replace('{count}', String(agent.homesSold))
  const v = messages.validation
  const form = useFormValidation(inquireSchema)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const nameMsg = validationMessage(form.error('name'), v)
  const emailMsg = validationMessage(form.error('email'), v)
  const nameOk = name.trim().length > 1
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const inquireFieldClass =
    'min-h-11 rounded-sm border border-line bg-surface-soft px-3 py-2.5 text-[13px] text-ink outline-none placeholder:text-muted focus:border-forest'

  const crumbs = fromProperty
    ? [
        {
          label:
            fromProperty.listingType === 'rent'
              ? propertyT.breadcrumbRent
              : propertyT.breadcrumbBuy,
          href: fromProperty.listingType === 'rent' ? '/rent' : '/buy',
        },
        {
          label: fromProperty.title,
          href: `/properties/${fromProperty.slug}`,
        },
        ...(fromViewing
          ? [
              {
                label: viewingT.breadcrumbCurrent,
                href: `/viewings/book?property=${encodeURIComponent(fromProperty.slug)}`,
              },
            ]
          : []),
        { label: agent.name },
      ]
    : [
        { label: t.breadcrumbHome, href: '/' },
        { label: t.breadcrumbAdvisors },
        { label: agent.name },
      ]

  function onInquire(event: FormEvent) {
    event.preventDefault()
    if (!form.validate({ name, email })) return
    const subject = encodeURIComponent(`Inquiry for ${agent.name}`)
    const body = encodeURIComponent(`Name: ${name.trim()}\nEmail: ${email.trim()}`)
    const to = agent.email || 'info@nesta.nl'
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`
  }

  return (
    <div className="flex min-h-screen flex-col max-[700px]:pb-[72px]">
      <SiteHeader header={header} />
      <main className="flex-1">
        <div className="mx-auto max-w-page px-[var(--page-pad)] pt-6 max-[700px]:pt-4">
          <Breadcrumbs items={crumbs} label={t.breadcrumbLabel} />
        </div>
        <div className="mx-auto grid max-w-page grid-cols-[400px_minmax(0,1fr)] gap-12 px-[var(--page-pad)] pb-16 pt-2 max-[1100px]:grid-cols-1 max-[1100px]:gap-8 max-[1100px]:pb-8 max-[700px]:gap-6 max-[700px]:pb-5">
          <div className="flex flex-col gap-8 max-[700px]:gap-4">
            <div className="relative h-[420px] w-full overflow-hidden rounded-md bg-line max-[700px]:h-[280px] max-[700px]:rounded-xl">
              {agent.photoUrl ? (
                <Image
                  src={agent.photoUrl}
                  alt={agent.photoAlt || agent.name}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1100px) 100vw, 400px"
                  unoptimized={isCmsMedia(agent.photoUrl)}
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-[#e7e1d7] to-[#d9d0c3]" />
              )}
            </div>

            <div className="rounded-md border border-line bg-surface p-6 max-[700px]:hidden">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <p className="m-0 text-xs font-bold uppercase tracking-[0.04em] text-muted">
                    {t.rating}
                  </p>
                  <p className="m-0 text-xl font-bold">{ratingLabel}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="m-0 text-xs font-bold uppercase tracking-[0.04em] text-muted">
                    {t.sold}
                  </p>
                  <p className="m-0 text-xl font-bold">{soldLabel}</p>
                </div>
              </div>
              <hr className="my-5 border-0 border-t border-line" />
              <div className="flex flex-col gap-1">
                <p className="m-0 text-xs font-bold uppercase tracking-[0.04em] text-muted">
                  {t.experience}
                </p>
                <p className="m-0 text-[15px] leading-snug">{agent.experienceLabel}</p>
              </div>
            </div>

            <div className="hidden grid-cols-2 gap-3 max-[700px]:grid">
              <div className="rounded-lg border border-line bg-surface p-3">
                <p className="m-0 text-[10px] font-bold uppercase tracking-[0.04em] text-muted">
                  {t.rating}
                </p>
                <p className="m-0 mt-1 text-base font-bold">{ratingLabel}</p>
              </div>
              <div className="rounded-lg border border-line bg-surface p-3">
                <p className="m-0 text-[10px] font-bold uppercase tracking-[0.04em] text-muted">
                  {t.sold}
                </p>
                <p className="m-0 mt-1 text-base font-bold">{soldLabel}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-10 max-[700px]:gap-6">
            <div className="flex flex-col gap-3 max-[700px]:gap-1">
              <p className="m-0 text-xs font-bold uppercase tracking-[0.06em] text-accent">
                {agent.role}
              </p>
              <h1 className="m-0 font-display text-[44px] font-normal leading-none max-[700px]:text-[32px] max-[700px]:font-medium">
                {agent.name}
              </h1>
              {agent.bio ? (
                <p className="m-0 max-w-[40rem] text-base leading-relaxed text-muted max-[700px]:text-sm max-[700px]:leading-normal">
                  {agent.bio}
                </p>
              ) : null}
            </div>

            {properties.length > 0 ? (
              <section className="flex flex-col gap-5">
                <hr className="m-0 border-0 border-t border-line max-[700px]:hidden" />
                <h2 className="m-0 font-display text-[28px] font-normal max-[700px]:text-[22px] max-[700px]:font-medium">
                  <span className="max-[700px]:hidden">
                    {t.propertiesBy.replace('{name}', firstName)}
                  </span>
                  <span className="hidden max-[700px]:inline">
                    {t.listingsBy.replace('{name}', firstName)}
                  </span>
                </h2>
                <div className="property-cards-lift grid grid-cols-2 gap-4 max-[700px]:gap-3">
                  {properties.map((item) => (
                    <PropertyCard
                      key={item.id || item.slug}
                      property={item}
                      locale={locale}
                      bedroomsOne={home.bedroomsLabelOne}
                      bedroomsMany={home.bedroomsLabel}
                      compact
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <section
              className={cn(
                'rounded-md border border-line bg-surface p-8 max-[700px]:rounded-xl max-[700px]:p-4',
              )}
            >
              <h2 className="m-0 mb-5 font-display text-[22px] font-normal max-[700px]:mb-4 max-[700px]:text-lg max-[700px]:font-medium">
                {t.inquireWith.replace('{name}', firstName)}
              </h2>
              <form className="flex flex-col gap-3" onSubmit={onInquire} noValidate>
                <div className="grid grid-cols-2 gap-3 max-[700px]:grid-cols-1">
                  <label className="flex flex-col gap-1.5">
                    <FieldLabel ok={nameOk && !nameMsg}>{t.yourName}</FieldLabel>
                    <input
                      type="text"
                      name="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        form.clearField('name')
                      }}
                      placeholder={t.yourName}
                      aria-invalid={Boolean(nameMsg)}
                      className={fieldClassName(
                        inquireFieldClass,
                        Boolean(nameMsg),
                        nameOk && !nameMsg,
                      )}
                    />
                    <FieldError message={nameMsg} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <FieldLabel ok={emailOk && !emailMsg}>{t.email}</FieldLabel>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        form.clearField('email')
                      }}
                      placeholder={t.email}
                      aria-invalid={Boolean(emailMsg)}
                      className={fieldClassName(
                        inquireFieldClass,
                        Boolean(emailMsg),
                        emailOk && !emailMsg,
                      )}
                    />
                    <FieldError message={emailMsg} />
                  </label>
                </div>
                <button type="submit" className={btnClass('primary', 'block')}>
                  {t.contactCta.replace('{name}', firstName)}
                </button>
                <p className="m-0 text-xs text-muted">{t.inquireNote}</p>
              </form>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter footer={footer} settings={settings} />
      <MobileBottomNav />
    </div>
  )
}
