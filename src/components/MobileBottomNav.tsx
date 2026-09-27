'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useLocale } from '@/i18n/locale-context'
import { cn } from '@/lib/ui'

const ITEMS = [
  { key: 'home' as const, href: '/', Icon: HomeIcon },
  { key: 'search' as const, href: '/buy', Icon: SearchIcon },
  { key: 'favorites' as const, href: '/favorites', Icon: HeartIcon },
  { key: 'viewings' as const, href: '/viewings', Icon: CalendarIcon },
  { key: 'profile' as const, href: '/dashboard?section=profile', Icon: UserIcon },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { messages } = useLocale()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 hidden border-t border-line bg-surface pb-[env(safe-area-inset-bottom,0)] max-[700px]:block"
      aria-label="Mobile"
    >
      <div className="flex h-16 items-center justify-between px-4">
        {ITEMS.map((item) => {
          const active =
            item.key === 'profile'
              ? pathname.startsWith('/dashboard')
              : item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href.split('?')[0] || item.href)
          const label = messages.mobileNav[item.key]
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'flex w-16 flex-col items-center gap-1 text-[10px] font-medium text-muted',
                active && 'font-bold text-forest',
              )}
            >
              <item.Icon />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M16 16l4 4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path
        d="M12 20s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7 3.8C19 15.6 12 20 12 20Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <rect x="4" y="5" width="16" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 3v4M16 3v4M4 10h16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <circle cx="12" cy="9" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M5.5 19.5c1.4-3 3.7-4.5 6.5-4.5s5.1 1.5 6.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}
