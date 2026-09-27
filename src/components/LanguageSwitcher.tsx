'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { LOCALE_COOKIE, LOCALE_MAX_AGE, type Locale } from '@/i18n/config'
import { useLocale } from '@/i18n/locale-context'
import { cn } from '@/lib/ui'

const OPTIONS: { id: Locale; name: string; short: string }[] = [
  { id: 'ru', name: 'Русский', short: 'RU' },
  { id: 'en', name: 'English', short: 'EN' },
]

export function LanguageSwitcher() {
  const { locale, messages } = useLocale()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [coords, setCoords] = useState({ top: 0, right: 0 })
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const current = OPTIONS.find((item) => item.id === locale) || OPTIONS[0]

  function setLocale(next: Locale) {
    setOpen(false)
    if (next === locale) return
    document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=${LOCALE_MAX_AGE}; SameSite=Lax`
    window.location.reload()
  }

  function placeMenu() {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    setCoords({
      top: Math.round(rect.bottom + 8),
      right: Math.round(window.innerWidth - rect.right),
    })
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    placeMenu()
  }, [open])

  useEffect(() => {
    if (!open) return

    function onPointer(event: MouseEvent) {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('resize', placeMenu)
    window.addEventListener('scroll', placeMenu, true)
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('resize', placeMenu)
      window.removeEventListener('scroll', placeMenu, true)
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const menu = open ? (
    <div
      ref={menuRef}
      className="fixed z-[100] min-w-[180px] rounded-md border border-line bg-surface p-1.5 shadow-[0_12px_32px_rgba(28,30,29,0.12)]"
      style={{ top: coords.top, right: coords.right }}
    >
      <ul id={listId} role="listbox" aria-label={messages.common.language} className="m-0 list-none p-0">
        {OPTIONS.map((item) => {
          const active = item.id === locale
          return (
            <li key={item.id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={active}
                className="grid w-full cursor-pointer grid-cols-[18px_1fr_auto] items-center gap-2 rounded-lg border-0 bg-transparent px-3 py-2.5 text-left hover:bg-nav-active"
                onClick={() => setLocale(item.id)}
              >
                <span className="h-3.5 w-3.5 text-forest" aria-hidden>
                  {active ? <CheckIcon /> : null}
                </span>
                <span>{item.name}</span>
                <em className="text-[11px] font-bold not-italic text-muted">{item.short}</em>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  ) : null

  return (
    <div className={cn('relative', open && 'is-open')} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-surface-muted px-2.5 py-1.5 text-ink"
        aria-label={messages.common.language}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
      >
        <GlobeIcon />
        <span className="text-[13px] font-semibold max-[700px]:hidden">{current.name}</span>
        <span className="hidden text-[11px] font-bold tracking-[0.06em] max-[700px]:inline">
          {current.short}
        </span>
        <ChevronIcon />
      </button>
      {mounted ? createPortal(menu, document.body) : null}
    </div>
  )
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3.5 12h17M12 3c2.8 2.4 4.2 5.6 4.2 9s-1.4 6.6-4.2 9c-2.8-2.4-4.2-5.6-4.2-9S9.2 5.4 12 3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden>
      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
      <path d="M3 8.2 6.4 11.5 13 4.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}
