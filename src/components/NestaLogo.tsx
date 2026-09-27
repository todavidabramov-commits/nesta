import Image from 'next/image'

import { cn } from '@/lib/ui'

type NestaLogoProps = {
  className?: string
  /**
   * Display height of the full lockup (icon + NESTA + REAL ESTATE).
   * Aspect is locked to the reference asset (~617×477).
   */
  size?: number
  /** `onDark` — cream lockup for footer */
  variant?: 'default' | 'onDark'
  /** Kept for API compat — lockup always includes wordmark */
  withWordmark?: boolean
  wordmark?: string
  tagline?: string
}

const LOCKUP_W = 617
const LOCKUP_H = 477

export function NestaLogo({
  className,
  size = 72,
  variant = 'default',
}: NestaLogoProps) {
  const onDark = variant === 'onDark'
  const src = onDark ? '/images/logo-lockup-v7-on-dark.png' : '/images/logo-lockup-v7.png'
  const height = size
  const width = Math.round(size * (LOCKUP_W / LOCKUP_H))

  return (
    <span className={cn('inline-flex items-center justify-center leading-none', className)}>
      <Image
        className="block h-auto max-w-full w-auto object-contain"
        src={src}
        alt="NESTA Real Estate"
        width={width}
        height={height}
        priority
        unoptimized
      />
    </span>
  )
}
