'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { signOutCustomer } from '@/app/(frontend)/actions/auth'
import { isCmsMedia } from '@/cms/utils'
import { useLocale } from '@/i18n/locale-context'
import type { CustomerSession } from '@/lib/customer-auth'
import { btnClass, cn } from '@/lib/ui'

const AVATAR = {
  sm: { box: 'size-7 rounded-xl text-[10px]', sizes: '28px' },
  md: { box: 'size-8 rounded-2xl text-[11px]', sizes: '32px' },
  lg: { box: 'size-32 rounded-full text-3xl min-[901px]:size-40 min-[901px]:text-4xl', sizes: '160px' },
} as const

export function CustomerAccountBadge({
  customer,
  href = '/dashboard',
  className,
  size = 'md',
  photoOnly = false,
  nameOnly = false,
  withSignOut = false,
}: {
  customer: CustomerSession
  href?: string
  className?: string
  size?: keyof typeof AVATAR
  photoOnly?: boolean
  nameOnly?: boolean
  withSignOut?: boolean
}) {
  const router = useRouter()
  const { messages } = useLocale()
  const [signingOut, setSigningOut] = useState(false)

  const displayName =
    [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.email
  const initials =
    `${customer.firstName?.[0] || ''}${customer.lastName?.[0] || ''}`.toUpperCase() ||
    customer.email[0]?.toUpperCase() ||
    'N'

  const avatarClass = AVATAR[size].box
  const textClass = size === 'sm' ? 'text-xs' : 'text-[13px]'
  const plainCircle = photoOnly && size === 'lg'
  const padClass = nameOnly
    ? withSignOut
      ? 'p-0'
      : size === 'sm'
        ? 'px-3 py-2'
        : 'px-3.5 py-2.5'
    : plainCircle
      ? 'p-0'
      : photoOnly
        ? size === 'sm'
          ? 'p-1.5'
          : 'p-2'
        : size === 'sm'
          ? 'gap-2 p-2'
          : 'gap-3 p-3'

  async function onSignOut() {
    if (signingOut) return
    setSigningOut(true)
    try {
      await signOutCustomer()
      router.push('/')
      router.refresh()
    } finally {
      setSigningOut(false)
    }
  }

  const avatar = customer.photoUrl ? (
    <span className={cn('relative shrink-0 overflow-hidden', avatarClass)}>
      <Image
        src={customer.photoUrl}
        alt=""
        fill
        unoptimized={isCmsMedia(customer.photoUrl)}
        className="object-cover"
        sizes={AVATAR[size].sizes}
      />
    </span>
  ) : (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center bg-forest font-bold text-surface',
        avatarClass,
      )}
    >
      {initials}
    </span>
  )

  if (nameOnly && withSignOut) {
    return (
      <div
        className={cn(
          'inline-flex max-w-full items-center rounded-full border border-line bg-surface',
          className,
        )}
      >
        <Link
          href={href}
          aria-label={displayName}
          className={cn(
            'truncate px-3 py-2 font-semibold text-ink no-underline',
            textClass,
          )}
        >
          {displayName}
        </Link>
        <span className="h-3.5 w-px shrink-0 bg-line" aria-hidden />
        <button
          type="button"
          onClick={onSignOut}
          disabled={signingOut}
          className={cn(
            'shrink-0 border-0 bg-transparent px-3 py-2 font-semibold text-muted transition-colors hover:text-forest disabled:opacity-60',
            textClass,
          )}
        >
          {messages.header.signOut}
        </button>
      </div>
    )
  }

  return (
    <Link
      href={href}
      aria-label={displayName}
      className={cn(
        'inline-flex max-w-full items-center no-underline',
        plainCircle ? 'rounded-full' : 'rounded-full border border-line bg-surface',
        padClass,
        className,
      )}
    >
      {nameOnly ? null : avatar}
      {photoOnly ? null : (
        <span className={cn('truncate font-semibold text-ink', textClass)}>{displayName}</span>
      )}
    </Link>
  )
}

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter()
  const { messages } = useLocale()
  const [signingOut, setSigningOut] = useState(false)

  async function onSignOut() {
    if (signingOut) return
    setSigningOut(true)
    try {
      await signOutCustomer()
      router.push('/')
      router.refresh()
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <button
      type="button"
      onClick={onSignOut}
      disabled={signingOut}
      className={cn(btnClass('outline', 'sm'), 'disabled:opacity-60', className)}
    >
      {messages.header.signOut}
    </button>
  )
}
