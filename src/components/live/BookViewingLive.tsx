'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type PointerEvent as ReactPointerEvent,
} from 'react'

import { createViewingRequest } from '@/app/(frontend)/actions/book-viewing'
import { applyLiveGlobal, type CmsDoc } from '@/cms/map'
import type { BookViewingView, PropertyView } from '@/cms/types'
import { isCmsMedia } from '@/cms/utils'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { useLiveGlobalEvent } from '@/components/LivePreviewListener'
import { useLocale } from '@/i18n/locale-context'
import { btnClass, cn } from '@/lib/ui'
import {
  VIEWING_SLOT_HOURS,
  formatConfirmWhen,
  formatMonthYear,
  formatSlotLabel,
  formatSlotsHeading,
  googleCalendarUrl,
  parseISODate,
  propertyAddressLabel,
  shiftWeek,
  todayISO,
  weekDays,
} from '@/lib/viewing'

function earliestSelectable(): string {
  return todayISO()
}

function defaultSelectedDate(preferred?: string): string {
  const min = earliestSelectable()
  if (preferred && preferred >= min) return preferred
  return min
}

export function BookViewingLive({ initial }: { initial: BookViewingView }) {
  const { locale, messages } = useLocale()
  const t = messages.bookViewing

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

  const [propertySlug, setPropertySlug] = useState(
    initial.property?.slug || initial.properties[0]?.slug || '',
  )
  const property =
    initial.properties.find((p) => p.slug === propertySlug) || initial.property || null

  const [weekAnchor, setWeekAnchor] = useState(() =>
    parseISODate(defaultSelectedDate(initial.initialDate)),
  )
  const [selectedDate, setSelectedDate] = useState(() => defaultSelectedDate(initial.initialDate))
  const [selectedTime, setSelectedTime] = useState(
    initial.initialTime &&
      VIEWING_SLOT_HOURS.includes(initial.initialTime as (typeof VIEWING_SLOT_HOURS)[number])
      ? initial.initialTime
      : '18:00',
  )
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetDragY, setSheetDragY] = useState(0)
  const [sheetDragging, setSheetDragging] = useState(false)
  const sheetRef = useRef<HTMLElement>(null)
  const dragRef = useRef<{
    pointerId: number
    startY: number
    startOffset: number
    maxHide: number
    currentY: number
  } | null>(null)

  const days = useMemo(() => weekDays(weekAnchor), [weekAnchor])
  const monthLabel = formatMonthYear(days[3] || days[0], locale)
  const minDate = earliestSelectable()
  const address = property
    ? propertyAddressLabel(property.address, property.neighborhood)
    : ''
  const whenLabel = formatConfirmWhen(selectedDate, selectedTime, locale)
  const showPropertyPick = initial.properties.length > 1 && !initial.propertyLocked

  useEffect(() => {
    if (confirmed) setSheetOpen(true)
  }, [confirmed])

  function collapsedOffset() {
    const content = sheetRef.current?.querySelector(
      '[data-viewing-sheet-content]',
    ) as HTMLElement | null
    if (!content) return 220
    return Math.max(content.scrollHeight + 8, 0)
  }

  function onSheetPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || !sheetRef.current) return
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

  function onConfirm() {
    if (!property?.id) {
      setError(t.noProperty)
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await createViewingRequest({
        propertyId: property.id,
        viewingDate: selectedDate,
        viewingTime: selectedTime,
      })
      if (!result.ok) {
        setError(t.error)
        return
      }
      setConfirmed(true)
      setSheetOpen(true)
    })
  }

  const calendarHref = property
    ? googleCalendarUrl({
        title: `${messages.common.brand}: ${property.title}`,
        address,
        isoDate: selectedDate,
        time: selectedTime,
        details: t.confirmedBodyMobile,
      })
    : '#'

  const confirmProps = {
    t,
    confirmed,
    property,
    address,
    whenLabel,
    calendarHref,
  }

  const propertyT = messages.property
  const listingHref = property
    ? ((property.listingType === 'rent' ? '/rent' : '/buy') as '/buy' | '/rent')
    : '/buy'
  const crumbs = property
    ? [
        {
          label:
            property.listingType === 'rent'
              ? propertyT.breadcrumbRent
              : propertyT.breadcrumbBuy,
          href: listingHref,
        },
        {
          label: property.title,
          href: `/properties/${property.slug}`,
        },
        { label: t.breadcrumbCurrent },
      ]
    : [
        { label: propertyT.breadcrumbBuy, href: '/buy' },
        { label: t.breadcrumbCurrent },
      ]

  const sheetStyle = sheetDragging
    ? ({
        transform: `translateY(${sheetDragY}px)`,
        transition: 'none',
      } as const)
    : undefined

  return (
    <div className="flex min-h-screen flex-col max-[1100px]:pb-[72px]">
      <SiteHeader header={header} />

      <div className="mx-auto w-full max-w-page px-[var(--page-pad)] pt-6 max-[1100px]:pt-5 max-[700px]:pt-4">
        <Breadcrumbs items={crumbs} label={t.breadcrumbLabel} />
      </div>

      <div
        className={cn(
          'mx-auto grid w-full max-w-page grid-cols-[minmax(0,1fr)_500px] items-start gap-10 px-[var(--page-pad)] pb-16 pt-2',
          'max-[1100px]:grid-cols-1 max-[1100px]:gap-0 max-[1100px]:px-[var(--page-pad)] max-[1100px]:pb-8 max-[1100px]:pt-0',
          confirmed && sheetOpen && 'max-[1100px]:pb-[380px]',
          confirmed && !sheetOpen && 'max-[1100px]:pb-24',
        )}
      >
        <section className="flex flex-col gap-6 rounded-md border border-line bg-surface p-8 max-[1100px]:gap-5 max-[1100px]:p-4">
          <h1 className="m-0 font-display text-[28px] font-normal leading-[1.15] text-ink max-[1100px]:text-2xl max-[1100px]:font-medium">
            <span className="max-[1100px]:hidden">{t.title}</span>
            <span className="hidden max-[1100px]:inline">{t.titleMobile}</span>
          </h1>

          {showPropertyPick ? (
            <label className="m-0 flex flex-col gap-2 text-xs font-bold uppercase tracking-[0.04em] text-muted">
              {t.pickProperty}
              <select
                className="min-h-[42px] rounded-sm border border-line bg-surface-soft px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-ink"
                value={propertySlug}
                onChange={(e) => {
                  setPropertySlug(e.target.value)
                  setConfirmed(false)
                  setSheetOpen(false)
                }}
              >
                {initial.properties.map((p) => (
                  <option key={p.id || p.slug} value={p.slug}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="flex w-full flex-col gap-4 max-[1100px]:gap-3">
            <div className="flex items-center justify-between gap-3">
              <p className="m-0 text-sm font-bold text-ink">{monthLabel}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Previous week"
                  className="inline-flex size-10 items-center justify-center rounded-sm border-0 bg-surface-muted text-muted transition-colors hover:bg-nav-active hover:text-ink max-[1100px]:size-11"
                  onClick={() => setWeekAnchor((d) => shiftWeek(d, -1))}
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  type="button"
                  aria-label="Next week"
                  className="inline-flex size-10 items-center justify-center rounded-sm border-0 bg-surface-muted text-muted transition-colors hover:bg-nav-active hover:text-ink max-[1100px]:size-11"
                  onClick={() => setWeekAnchor((d) => shiftWeek(d, 1))}
                >
                  <ChevronRightIcon />
                </button>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 max-[1100px]:gap-3">
              <div className="grid grid-cols-7 gap-3 text-center text-xs font-bold text-muted max-[1100px]:gap-2.5">
                {t.weekdays.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-3 max-[1100px]:gap-2.5">
                {days.map((day) => {
                  const iso = todayISO(day)
                  const disabled = iso < minDate
                  const selected = iso === selectedDate
                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={disabled}
                      className={cn(
                        'flex min-h-9 items-center justify-center rounded-sm border-0 px-0 py-2.5 text-[13px] font-bold transition-colors',
                        selected
                          ? 'bg-forest text-surface'
                          : 'bg-surface-muted text-ink hover:bg-nav-active',
                        disabled && 'cursor-not-allowed opacity-35 hover:bg-surface-muted',
                      )}
                      onClick={() => {
                        setSelectedDate(iso)
                        setConfirmed(false)
                        setSheetOpen(false)
                      }}
                    >
                      {day.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <hr className="m-0 w-full border-0 border-t border-line" />

          <div className="flex w-full flex-col gap-3 max-[1100px]:gap-2.5">
            <p className="m-0 text-xs font-bold uppercase tracking-[0.04em] text-muted max-[1100px]:text-[11px]">
              {t.availableSlots.replace('{date}', formatSlotsHeading(selectedDate, locale))}
            </p>
            <div className="flex flex-wrap gap-3 max-[1100px]:gap-2">
              {VIEWING_SLOT_HOURS.map((slot) => {
                const active = slot === selectedTime
                return (
                  <button
                    key={slot}
                    type="button"
                    className={cn(
                      'rounded-sm border px-4 py-3 text-[13px] font-semibold transition-colors max-[1100px]:px-3 max-[1100px]:py-2.5 max-[1100px]:text-xs',
                      active
                        ? 'border-forest bg-[#e8efea] text-forest max-[1100px]:font-bold'
                        : 'border-line bg-surface text-ink hover:border-forest/40',
                    )}
                    onClick={() => {
                      setSelectedTime(slot)
                      setConfirmed(false)
                      setSheetOpen(false)
                    }}
                  >
                    {formatSlotLabel(slot, locale)}
                  </button>
                )
              })}
            </div>
          </div>

          {error ? <p className="m-0 text-sm text-[#8a3b2d]">{error}</p> : null}

          <button
            type="button"
            className={cn(btnClass('primary', 'block'), 'py-3.5 text-sm font-bold shadow-none')}
            disabled={!property || pending}
            onClick={onConfirm}
          >
            {pending ? t.submitting : t.confirmCta}
          </button>
        </section>

        <aside className="flex w-full flex-col gap-8 rounded-md border border-line bg-[#e8efea] p-10 max-[1100px]:hidden">
          <ConfirmPanel {...confirmProps} variant="desktop" />
        </aside>
      </div>

      {confirmed ? (
        <aside
          ref={sheetRef}
          className={cn(
            'fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom,0px))] z-[45] hidden flex-col rounded-t-2xl border border-b-0 border-line bg-[#e8efea] px-5 pb-4 shadow-[0_-4px_8px_rgba(0,0,0,0.06)] will-change-transform max-[1100px]:flex',
            'transition-transform duration-[280ms] ease-out',
            sheetDragging && 'transition-none',
            !sheetOpen && !sheetDragging && 'pb-3',
          )}
          style={sheetStyle}
          aria-expanded={sheetOpen}
        >
          <div
            className={cn(
              'flex cursor-grab touch-none flex-col select-none',
              sheetDragging && 'cursor-grabbing',
            )}
            onPointerDown={onSheetPointerDown}
            onPointerMove={onSheetPointerMove}
            onPointerUp={(event) => endSheetDrag(event.pointerId)}
            onPointerCancel={(event) => endSheetDrag(event.pointerId)}
          >
            <div className="flex h-7 w-full items-center justify-center" aria-hidden>
              <span className="block h-1 w-10 rounded-full bg-[#e1e3de]" />
            </div>
            {!sheetOpen && !sheetDragging ? (
              <p className="m-0 pb-1 text-center text-sm font-bold text-forest">
                {t.confirmedBadge}
              </p>
            ) : null}
          </div>

          <div
            data-viewing-sheet-content
            className={cn(
              'flex flex-col gap-5 overflow-hidden pt-1 transition-[max-height,opacity,padding] duration-[280ms] ease-out',
              sheetOpen || sheetDragging
                ? 'max-h-[420px] opacity-100'
                : 'pointer-events-none max-h-0 opacity-0 pt-0',
            )}
          >
            <ConfirmPanel {...confirmProps} variant="mobile" />
          </div>
        </aside>
      ) : null}

      <div className="max-[1100px]:hidden">
        <SiteFooter footer={footer} settings={settings} />
      </div>
      <MobileBottomNav />
    </div>
  )
}

function ConfirmPanel({
  t,
  confirmed,
  property,
  address,
  whenLabel,
  calendarHref,
  variant,
}: {
  t: ReturnType<typeof useLocale>['messages']['bookViewing']
  confirmed: boolean
  property: PropertyView | null
  address: string
  whenLabel: string
  calendarHref: string
  variant: 'desktop' | 'mobile'
}) {
  const title = confirmed
    ? variant === 'mobile'
      ? t.confirmedTitleMobile
      : t.confirmedTitle
    : t.previewTitle
  const body = confirmed
    ? variant === 'mobile'
      ? t.confirmedBodyMobile
      : t.confirmedBody
    : t.confirmHint
  const mobile = variant === 'mobile'
  const agent = property?.agent
  const agentName = agent?.name || t.agentName
  const agentRole = agent?.role || t.agentRole
  const agentHref = agent
    ? `/agents/${agent.slug}?from=${encodeURIComponent(property!.slug)}&via=viewing`
    : null

  const agentRow = (
    <>
      <span
        className={cn(
          'relative shrink-0 overflow-hidden rounded-full bg-forest',
          mobile ? 'size-10' : 'size-8',
        )}
        aria-hidden={!agent?.photoUrl}
      >
        {agent?.photoUrl ? (
          <Image
            src={agent.photoUrl}
            alt=""
            fill
            className="object-cover"
            sizes={mobile ? '40px' : '32px'}
            unoptimized={isCmsMedia(agent.photoUrl)}
          />
        ) : null}
      </span>
      <span className="min-w-0">
        <strong className={cn('block font-bold text-ink', mobile ? 'text-[13px]' : 'text-sm')}>
          {agentName}
        </strong>
        <span className={cn('mt-0.5 block text-muted', mobile ? 'text-[11px]' : 'text-xs')}>
          {agentRole}
        </span>
        {agentHref ? (
          <span
            className={cn(
              'mt-1 inline-flex items-center gap-1 font-semibold text-forest',
              mobile ? 'text-[11px]' : 'text-xs',
            )}
          >
            {t.viewAdvisor}
            <span aria-hidden className="translate-y-px text-[10px]">
              →
            </span>
          </span>
        ) : null}
      </span>
    </>
  )

  return (
    <>
      <div className={cn('flex flex-col', mobile ? 'gap-1.5' : 'gap-2')}>
        {confirmed ? (
          <p
            className={cn(
              'm-0 font-bold uppercase tracking-[0.04em] text-forest',
              mobile ? 'text-[11px]' : 'text-xs',
            )}
          >
            {t.confirmedBadge}
          </p>
        ) : null}
        <h2
          className={cn(
            'm-0 font-display leading-[1.15] text-ink',
            mobile ? 'text-[28px] font-medium' : 'text-[32px] font-normal',
          )}
        >
          {title}
        </h2>
        <p
          className={cn(
            'm-0 text-muted',
            mobile ? 'text-[13px] leading-[1.4]' : 'text-sm leading-normal',
          )}
        >
          {body}
        </p>
      </div>

      <hr className="m-0 w-full border-0 border-t border-line" />

      <div className={cn('flex w-full flex-col', mobile ? 'gap-0' : 'gap-4')}>
        {agentHref ? (
          <Link
            href={agentHref}
            className="flex items-center gap-3 text-inherit no-underline transition-opacity hover:opacity-85"
          >
            {agentRow}
          </Link>
        ) : (
          <div className="flex items-center gap-3">{agentRow}</div>
        )}

        <div
          className={cn(
            'flex flex-col gap-1 bg-surface',
            mobile ? 'mt-5 rounded-lg border border-line p-3' : 'rounded-sm p-4',
          )}
        >
          <p
            className={cn(
              'm-0 font-bold uppercase tracking-[0.04em] text-accent',
              mobile ? 'text-[11px]' : 'text-xs',
            )}
          >
            {whenLabel}
          </p>
          <p
            className={cn(
              'm-0 font-bold text-ink',
              mobile ? 'font-display text-[15px]' : 'text-sm',
            )}
          >
            {property?.title || '—'}
          </p>
          <p className={cn('m-0 text-muted', mobile ? 'text-xs' : 'text-[13px]')}>
            {address || '—'}
          </p>
        </div>
      </div>

      {confirmed ? (
        <Link
          href={calendarHref}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            btnClass('primary', 'block'),
            'shadow-none',
            mobile ? 'py-3 text-xs font-bold' : 'py-3 text-[13px] font-semibold',
          )}
        >
          {t.calendarCta}
        </Link>
      ) : null}
    </>
  )
}

function ChevronLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      aria-hidden
      className="max-[1100px]:size-[22px]"
    >
      <path
        d="M14.5 6.5 9 12l5.5 5.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      aria-hidden
      className="max-[1100px]:size-[22px]"
    >
      <path
        d="M9.5 6.5 15 12l-5.5 5.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
