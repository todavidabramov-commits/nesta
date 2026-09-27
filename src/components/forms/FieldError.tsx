'use client'

import { Check } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/ui'

export function FieldError({
  message,
  className,
}: {
  message?: string
  className?: string
}) {
  if (!message) return null

  return (
    <p
      role="alert"
      className={cn(
        'm-0 text-[12px] font-medium leading-snug text-[#8b3a2f]',
        'motion-safe:animate-[field-error-in_200ms_ease-out]',
        className,
      )}
    >
      {message}
    </p>
  )
}

export function FieldLabel({
  children,
  ok,
  trailing,
  className,
  plain,
}: {
  children: ReactNode
  ok?: boolean
  trailing?: ReactNode
  className?: string
  /** Non-uppercase label style (e.g. profile password fields). */
  plain?: boolean
}) {
  return (
    <span
      className={cn(
        'flex items-center justify-between gap-2',
        plain
          ? 'text-[13px] font-medium tracking-normal text-ink'
          : 'text-[11px] font-bold uppercase tracking-wide text-muted',
        className,
      )}
    >
      <span className="min-w-0">{children}</span>
      <span className="inline-flex shrink-0 items-center gap-2">
        {trailing}
        {ok ? <Check className="size-3 text-[#2a5c3f]" strokeWidth={3} aria-hidden /> : null}
      </span>
    </span>
  )
}

/** Append invalid / valid border styles to a shared field class string. */
export function fieldClassName(base: string, invalid?: boolean, ok?: boolean) {
  return cn(
    base,
    invalid && 'border-[#c45c4a] focus:border-[#c45c4a] focus:ring-0',
    ok && !invalid && 'border-[#2a5c3f]',
  )
}
