'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import type { HeaderView } from '@/cms/types'
import { CustomerAccountBadge } from '@/components/CustomerAccountBadge'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { NestaLogo } from '@/components/NestaLogo'
import { useCustomer } from '@/components/CustomerProvider'
import { useLocale } from '@/i18n/locale-context'
import { cn } from '@/lib/ui'

const navLinkClass =
  'relative rounded-sm px-2.5 py-2 text-sm font-medium text-muted transition-colors duration-[220ms] hover:text-forest focus-visible:text-forest focus-visible:outline-none after:absolute after:bottom-[5px] after:left-1/2 after:h-[1.5px] after:w-0 after:-translate-x-1/2 after:rounded-sm after:bg-gradient-to-r after:from-accent after:to-forest after:transition-[width] after:duration-[320ms] after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:after:w-[calc(100%-20px)] focus-visible:after:w-[calc(100%-20px)] motion-reduce:transition-none motion-reduce:after:transition-none'

const signInClass =
  'relative text-sm font-medium text-ink transition-colors duration-200 hover:text-forest focus-visible:text-forest focus-visible:outline-none after:absolute after:bottom-[-2px] after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-[280ms] after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:after:scale-x-100 focus-visible:after:scale-x-100 motion-reduce:transition-none motion-reduce:after:transition-none'

const iconBtnClass =
  'inline-flex h-7 w-7 items-center justify-center border-0 bg-transparent p-0 text-ink cursor-pointer'

export function SiteHeader({ header }: { header: HeaderView }) {
  const pathname = usePathname()
  const { messages } = useLocale()
  const { customer } = useCustomer()
  const [menuOpen, setMenuOpen] = useState(false)

  const accountHref = customer ? '/dashboard' : header.signInHref

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const accountControl = customer ? (
    <CustomerAccountBadge customer={customer} href="/dashboard" size="sm" nameOnly withSignOut />
  ) : (
    <Link href={accountHref} className={signInClass}>
      {messages.header.signIn}
    </Link>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex h-24 w-full max-w-page items-center justify-between gap-6 px-[var(--page-pad)] max-[700px]:h-20">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-2 [&_img]:h-16 [&_img]:w-auto max-[700px]:[&_img]:h-[52px]"
          aria-label={messages.common.brand}
        >
          <NestaLogo size={64} />
        </Link>

        <nav className="flex items-center gap-5 max-[1100px]:hidden" aria-label="Primary">
          {header.nav.map((item, index) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={`nav-${index}-${item.href}`}
                href={item.href}
                className={cn(navLinkClass, active && 'font-semibold text-ink after:w-[calc(100%-20px)]')}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-4 max-[1100px]:hidden">
          <LanguageSwitcher />
          {accountControl}
        </div>

        <div className="hidden shrink-0 items-center gap-4 max-[1100px]:flex">
          <Link href="/buy" className={iconBtnClass} aria-label={messages.common.search}>
            <SearchIcon />
          </Link>
          <button
            type="button"
            className={iconBtnClass}
            aria-label={menuOpen ? messages.common.closeMenu : messages.common.openMenu}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="hidden border-t border-line bg-surface px-[var(--page-pad)] pb-6 pt-4 max-[1100px]:block">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {header.nav.map((item, index) => (
              <Link
                key={`drawer-${index}-${item.href}`}
                href={item.href}
                className="rounded-sm border-b border-line px-2.5 py-3 text-[15px] font-medium text-muted transition-colors duration-200 hover:text-forest focus-visible:text-forest focus-visible:outline-none"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <LanguageSwitcher />
            {customer ? (
              <CustomerAccountBadge
                customer={customer}
                href="/dashboard"
                size="sm"
                nameOnly
                withSignOut
                className="max-[1100px]:max-w-[280px]"
              />
            ) : (
              <Link href={accountHref} className={signInClass} onClick={() => setMenuOpen(false)}>
                {messages.header.signIn}
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 16l4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
