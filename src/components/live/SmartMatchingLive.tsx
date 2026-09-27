'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { applyLiveGlobal, type CmsDoc } from '@/cms/map'
import type { MatchingView } from '@/cms/types'
import { isCmsMedia } from '@/cms/utils'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { useLiveGlobalEvent } from '@/components/LivePreviewListener'
import { useLocale } from '@/i18n/locale-context'
import { formatPropertyPrice } from '@/lib/format-price'
import {
  budgetBounds,
  formatBudgetShort,
  rankMatches,
  type MatchingPriorityId,
  type MatchingPurpose,
  type MatchedProperty,
} from '@/lib/matching'
import { btnClass, cn, pageShell } from '@/lib/ui'

const PRIORITY_IDS: MatchingPriorityId[] = [
  'space',
  'quiet',
  'transit',
  'schools',
  'center',
  'outdoor',
  'parking',
]

const BED_OPTIONS = [1, 2, 3, 4] as const
const TOTAL_STEPS = 4

type Step = 1 | 2 | 3 | 4 | 5

export function SmartMatchingLive({ initial }: { initial: MatchingView }) {
  const { locale, messages } = useLocale()
  const t = messages.matching
  const home = messages.home

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

  const [step, setStep] = useState<Step>(1)
  const [purpose, setPurpose] = useState<MatchingPurpose>('buy')
  const bounds = budgetBounds(purpose)
  const [budgetMin, setBudgetMin] = useState(300_000)
  const [budgetMax, setBudgetMax] = useState(600_000)
  const [bedrooms, setBedrooms] = useState(2)
  const [priorities, setPriorities] = useState<MatchingPriorityId[]>(['space', 'quiet', 'outdoor'])
  const [matches, setMatches] = useState<MatchedProperty[]>([])

  const crumbs = useMemo(
    () => [
      { label: t.breadcrumbHome, href: '/' },
      { label: t.breadcrumbBuy, href: '/buy' },
      { label: t.breadcrumbCurrent },
    ],
    [t.breadcrumbHome, t.breadcrumbBuy, t.breadcrumbCurrent],
  )

  const stepNames = [t.steps.intent, t.steps.preferences, t.steps.budget, t.steps.specs] as const
  const wizardStep = Math.min(step, TOTAL_STEPS) as 1 | 2 | 3 | 4
  const stepLabel = t.stepOf
    .replace('{step}', String(wizardStep))
    .replace('{name}', stepNames[wizardStep - 1])

  const lead =
    step === 1 ? t.lead1 : step === 2 ? t.lead2 : step === 3 ? t.lead3 : step === 4 ? t.lead4 : null

  function setPurposeAndBudget(next: MatchingPurpose) {
    setPurpose(next)
    if (next === 'rent') {
      setBudgetMin(2_000)
      setBudgetMax(4_000)
    } else {
      setBudgetMin(300_000)
      setBudgetMax(600_000)
    }
  }

  function togglePriority(id: MatchingPriorityId) {
    setPriorities((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  function onBudgetMin(value: number) {
    setBudgetMin(Math.min(value, budgetMax - bounds.step))
  }

  function onBudgetMax(value: number) {
    setBudgetMax(Math.max(value, budgetMin + bounds.step))
  }

  function generate() {
    const next = rankMatches(
      initial.properties,
      { purpose, priorities, budgetMin, budgetMax, bedrooms },
      locale,
      4,
    )
    setMatches(next)
    setStep(5)
  }

  function refine() {
    setStep(1)
  }

  const purposeShort = purpose === 'buy' ? t.purposeShortBuy : t.purposeShortRent
  const priorityLabels = priorities.map((id) => t.priorities[id])
  const priorityShortLabels = priorities.map((id) => t.priorityShort[id])
  const budgetRange = `${formatBudgetShort(budgetMin, purpose, locale)}—${formatBudgetShort(budgetMax, purpose, locale)}`
  const minPct = ((budgetMin - bounds.min) / (bounds.max - bounds.min)) * 100
  const maxPct = ((budgetMax - bounds.min) / (bounds.max - bounds.min)) * 100

  const summaryStep2 = `${purposeShort} • ${t.prioritiesSelected.replace('{count}', String(priorities.length))}`
  const summaryStep3 = `${purposeShort} • ${priorityLabels.join(', ') || '—'}`
  const summaryStep4 = `${purposeShort} • ${budgetRange} • ${priorityShortLabels.join(', ') || '—'}`

  return (
    <div className="flex min-h-screen flex-col max-[700px]:pb-[72px]">
      <SiteHeader header={header} />
      <main className="flex-1">
        <div className={cn(pageShell, 'pt-6 max-[700px]:pt-4')}>
          <Breadcrumbs items={crumbs} label={t.breadcrumbLabel} />
        </div>

        {step === 5 ? (
          <div className={cn(pageShell, 'flex flex-col gap-10 pb-20 pt-2 max-[700px]:gap-6 max-[700px]:pb-10')}>
            <div className="flex items-end justify-between gap-6 max-[900px]:flex-col max-[900px]:items-start">
              <header className="flex flex-col gap-3">
                <h1 className="m-0 font-display text-[48px] font-normal leading-none text-ink max-[700px]:text-[32px]">
                  {t.resultsTitle}
                </h1>
                <p className="m-0 text-base text-muted max-[700px]:text-sm">{t.resultsLead}</p>
              </header>
              <div className="flex shrink-0 gap-3 max-[700px]:w-full max-[700px]:flex-col">
                <button
                  type="button"
                  onClick={refine}
                  className={cn(btnClass('outline', 'sm'), 'shadow-none max-[700px]:w-full')}
                >
                  {t.refine}
                </button>
                <Link
                  href={purpose === 'buy' ? '/buy' : '/rent'}
                  className={cn(btnClass('primary', 'sm'), 'no-underline shadow-none max-[700px]:w-full')}
                >
                  {t.compareSave}
                </Link>
              </div>
            </div>

            {!matches.length ? (
              <p className="m-0 text-sm text-muted">{t.noResults}</p>
            ) : (
              <div className="grid grid-cols-2 gap-6 max-[900px]:grid-cols-1 max-[700px]:gap-4">
                {matches.map((item) => (
                  <MatchCard
                    key={item.property.id || item.property.slug}
                    item={item}
                    locale={locale}
                    badge={t.matchBadge.replace('{score}', String(item.score))}
                    whyTitle={t.whyTitle}
                    bedroomsOne={home.bedroomsLabelOne}
                    bedroomsMany={home.bedroomsLabel}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={cn(pageShell, 'flex flex-col items-center gap-10 pb-20 pt-2 max-[700px]:gap-6 max-[700px]:pb-10')}>
            <header className="mx-auto max-w-[600px] text-center max-[700px]:max-w-none max-[700px]:text-left">
              <h1 className="m-0 font-display text-[48px] font-normal leading-none text-ink max-[700px]:text-[32px]">
                {t.title}
              </h1>
              {lead ? (
                <p className="mt-3 m-0 text-base leading-normal text-muted max-[700px]:text-sm">{lead}</p>
              ) : null}
            </header>

            <section className="w-full max-w-[1000px] rounded-md border border-line bg-surface p-10 shadow-[0_12px_16px_rgba(0,0,0,0.04)] max-[700px]:rounded-xl max-[700px]:p-4">
              <div className="mb-8 flex items-center justify-between gap-4 max-[700px]:mb-5">
                <p className="m-0 text-xs font-bold uppercase tracking-[0.04em] text-accent">{stepLabel}</p>
                <div className="flex gap-1" aria-hidden>
                  {[1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className={cn(
                        'h-1 w-8 rounded-sm max-[700px]:w-5',
                        i <= wizardStep ? 'bg-forest' : 'bg-[#e1e3de]',
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-8 max-[700px]:gap-5">
                {step > 1 ? (
                  <div className="flex items-center gap-2 rounded-sm bg-[#e8efea] p-3 text-[13px] text-forest">
                    <CheckIcon className="size-3.5 shrink-0" />
                    <p className="m-0">
                      <span className="font-semibold">{t.currentSelections} </span>
                      <span className="font-normal">
                        {step === 2 ? summaryStep2 : step === 3 ? summaryStep3 : summaryStep4}
                      </span>
                    </p>
                  </div>
                ) : null}

                {step === 1 ? (
                  <fieldset className="m-0 border-0 p-0">
                    <legend className="mb-6 text-xs font-bold uppercase tracking-[0.04em] text-muted">
                      {t.purposeLabel}
                    </legend>
                    <div className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1 max-[700px]:gap-2.5">
                      <IntentCard
                        active={purpose === 'buy'}
                        title={t.purposeBuy}
                        description={t.purposeBuyDesc}
                        onClick={() => setPurposeAndBudget('buy')}
                      />
                      <IntentCard
                        active={purpose === 'rent'}
                        title={t.purposeRent}
                        description={t.purposeRentDesc}
                        onClick={() => setPurposeAndBudget('rent')}
                      />
                    </div>
                  </fieldset>
                ) : null}

                {step === 2 ? (
                  <fieldset className="m-0 border-0 p-0">
                    <legend className="mb-6 text-xs font-bold uppercase tracking-[0.04em] text-muted">
                      {t.prioritiesLabel}
                    </legend>
                    <div className="flex flex-wrap gap-3 max-[700px]:gap-2">
                      {PRIORITY_IDS.map((id) => {
                        const active = priorities.includes(id)
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => togglePriority(id)}
                            className={cn(
                              'inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-colors max-[700px]:px-3 max-[700px]:py-2 max-[700px]:text-xs',
                              active
                                ? 'border-2 border-forest bg-[#e8efea] text-forest'
                                : 'border-line bg-surface text-muted hover:border-forest/40',
                            )}
                          >
                            {t.priorities[id]}
                            {active ? <CheckIcon className="size-3.5" /> : null}
                          </button>
                        )
                      })}
                    </div>
                  </fieldset>
                ) : null}

                {step === 3 ? (
                  <div className="flex flex-col gap-7">
                    <p className="m-0 text-xs font-bold uppercase tracking-[0.04em] text-muted">
                      {t.budgetRangeLabel}
                    </p>
                    <div className="grid grid-cols-2 gap-6 max-[700px]:grid-cols-1 max-[700px]:gap-4">
                      <label className="flex flex-col gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-muted">
                          {t.minPrice}
                        </span>
                        <input
                          type="text"
                          readOnly
                          value={formatPropertyPrice(budgetMin, locale, purpose)}
                          className="rounded-sm border border-line bg-[#fcfaf6] px-3.5 py-3.5 text-[15px] text-ink outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-muted">
                          {t.maxPrice}
                        </span>
                        <input
                          type="text"
                          readOnly
                          value={formatPropertyPrice(budgetMax, locale, purpose)}
                          className="rounded-sm border border-line bg-[#fcfaf6] px-3.5 py-3.5 text-[15px] text-ink outline-none"
                        />
                      </label>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="relative flex h-6 items-center">
                        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-sm bg-[#e1e3de]" />
                        <div
                          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-sm bg-forest"
                          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
                        />
                        <input
                          type="range"
                          min={bounds.min}
                          max={bounds.max}
                          step={bounds.step}
                          value={budgetMin}
                          onChange={(e) => onBudgetMin(Number(e.target.value))}
                          className="matching-range matching-range--min absolute inset-0 w-full appearance-none bg-transparent"
                          aria-label={t.minPrice}
                        />
                        <input
                          type="range"
                          min={bounds.min}
                          max={bounds.max}
                          step={bounds.step}
                          value={budgetMax}
                          onChange={(e) => onBudgetMax(Number(e.target.value))}
                          className="matching-range matching-range--max absolute inset-0 w-full appearance-none bg-transparent"
                          aria-label={t.maxPrice}
                        />
                      </div>
                      <div className="flex justify-between text-[13px] text-muted">
                        <span>
                          {t.budgetAxisMin.replace(
                            '{value}',
                            formatBudgetShort(bounds.min, purpose, locale),
                          )}
                        </span>
                        <span>
                          {t.budgetAxisMax.replace(
                            '{value}',
                            purpose === 'buy' ? '€2M+' : formatBudgetShort(bounds.max, purpose, locale),
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3 rounded-lg border border-line bg-[#fcfaf6] p-4">
                      <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted" />
                      <p className="m-0 text-[13px] leading-[1.4] text-muted">
                        {t.budgetHint.replace('{min}', budgetRange.split('—')[0]).replace('{max}', budgetRange.split('—')[1])}
                      </p>
                    </div>
                  </div>
                ) : null}

                {step === 4 ? (
                  <div className="flex flex-col gap-8">
                    <fieldset className="m-0 border-0 p-0">
                      <legend className="mb-3 text-xs font-bold uppercase tracking-[0.04em] text-muted">
                        {t.bedroomsLabel}
                      </legend>
                      <div className="grid grid-cols-4 gap-4 max-[700px]:gap-2">
                        {BED_OPTIONS.map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setBedrooms(n)}
                            className={cn(
                              'flex h-20 items-center justify-center rounded-lg border text-[22px] font-bold transition-colors max-[700px]:h-14 max-[700px]:text-lg',
                              bedrooms === n
                                ? 'border-forest bg-forest text-surface'
                                : 'border-line bg-surface text-ink hover:border-forest/40',
                            )}
                          >
                            {n === 4 ? t.bedrooms4Plus : n}
                          </button>
                        ))}
                      </div>
                    </fieldset>

                    <div className="border-t border-line pt-6">
                      <p className="m-0 mb-4 text-sm font-bold uppercase tracking-[0.04em] text-muted">
                        {t.reviewTitle}
                      </p>
                      <div className="flex flex-wrap gap-8 text-sm max-[700px]:gap-4">
                        <div className="flex gap-2">
                          <span className="text-muted">{t.reviewIntent}</span>
                          <span className="font-semibold text-ink">{purposeShort}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-muted">{t.reviewBudget}</span>
                          <span className="font-semibold text-ink">{budgetRange}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-muted">{t.reviewBeds}</span>
                          <span className="font-semibold text-ink">
                            {t.bedsValue.replace('{count}', bedrooms === 4 ? '4+' : String(bedrooms))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center justify-between gap-4 max-[700px]:flex-col-reverse max-[700px]:items-stretch">
                  {step === 1 ? (
                    <span className="hidden max-[700px]:hidden" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setStep((step - 1) as Step)}
                      className={cn(btnClass('outline', 'sm'), 'px-6 py-3.5 text-[15px] shadow-none')}
                    >
                      {t.back.replace('{step}', stepNames[wizardStep - 2])}
                    </button>
                  )}
                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={() => setStep((step + 1) as Step)}
                      className={cn(
                        btnClass('primary', 'sm'),
                        'ml-auto px-8 py-4 text-[15px] shadow-none max-[700px]:ml-0 max-[700px]:w-full',
                      )}
                    >
                      {t.continue}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={generate}
                      className={cn(
                        btnClass('primary', 'sm'),
                        'ml-auto px-8 py-4 text-[15px] shadow-none max-[700px]:ml-0 max-[700px]:w-full',
                      )}
                    >
                      {t.generate}
                    </button>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
      <SiteFooter footer={footer} settings={settings} />
      <MobileBottomNav />
    </div>
  )
}

function IntentCard({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col gap-4 rounded-lg p-6 text-left transition-colors max-[700px]:gap-3 max-[700px]:p-4',
        active
          ? 'border-2 border-forest bg-[#e8efea]'
          : 'border border-line bg-surface hover:border-forest/40',
      )}
    >
      <div className="flex w-full items-start justify-between gap-3">
        <p
          className={cn(
            'm-0 text-lg max-[700px]:text-base',
            active ? 'font-bold text-forest' : 'font-semibold text-ink',
          )}
        >
          {title}
        </p>
        {active ? (
          <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-forest text-surface">
            <CheckIcon className="size-3" />
          </span>
        ) : (
          <span className="size-5 shrink-0 rounded-full border border-line" />
        )}
      </div>
      <p className="m-0 text-sm leading-normal text-muted">{description}</p>
    </button>
  )
}

function MatchCard({
  item,
  locale,
  badge,
  whyTitle,
  bedroomsOne,
  bedroomsMany,
}: {
  item: MatchedProperty
  locale: string
  badge: string
  whyTitle: string
  bedroomsOne: string
  bedroomsMany: string
}) {
  const property = item.property
  const beds =
    locale === 'ru' && property.bedrooms === 1
      ? bedroomsOne
      : locale === 'en' && property.bedrooms === 1
        ? bedroomsOne
        : bedroomsMany
  const bedsLabel = beds.replace('{count}', String(property.bedrooms))

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="flex flex-col overflow-hidden rounded-card border border-line bg-surface text-inherit no-underline shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-opacity hover:opacity-95"
    >
      <div className="relative h-[220px] bg-line max-[700px]:h-40">
        {property.coverUrl ? (
          <Image
            src={property.coverUrl}
            alt={property.coverAlt || property.title}
            fill
            className="object-cover"
            sizes="(max-width: 900px) 100vw, 50vw"
            unoptimized={isCmsMedia(property.coverUrl)}
          />
        ) : null}
        <span className="absolute left-4 top-4 rounded-full bg-forest px-3 py-1.5 text-[13px] font-bold text-surface max-[700px]:left-3 max-[700px]:top-3 max-[700px]:text-[11px]">
          {badge}
        </span>
      </div>
      <div className="flex flex-col gap-4 p-5 max-[700px]:gap-3 max-[700px]:p-4">
        <div className="flex flex-col gap-2">
          <p className="m-0 text-xs font-bold uppercase tracking-[0.04em] text-accent">
            {property.neighborhood}
          </p>
          <h3 className="m-0 font-display text-[22px] font-semibold leading-tight max-[700px]:text-lg">
            {property.title}
          </h3>
          <p className="m-0 text-lg font-bold max-[700px]:text-sm">
            {formatPropertyPrice(property.price, locale, property.listingType)}
          </p>
        </div>
        {item.reasons.length ? (
          <div className="rounded-sm bg-[#e8efea] p-3">
            <p className="m-0 text-xs font-bold uppercase text-forest">✓ {whyTitle}</p>
            <ul className="m-0 mt-2 list-none space-y-1 p-0">
              {item.reasons.map((reason) => (
                <li key={reason} className="text-[13px] leading-snug text-muted">
                  • {reason}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="flex gap-4 text-[13px] text-muted">
          <span>{property.areaM2} m²</span>
          <span>{bedsLabel}</span>
        </div>
      </div>
    </Link>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden fill="none">
      <path
        d="M3.5 8.2 6.4 11.2 12.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden fill="none">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 7.2v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.9" fill="currentColor" />
    </svg>
  )
}
