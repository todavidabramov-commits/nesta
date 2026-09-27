import Link from 'next/link'

import { cn } from '@/lib/ui'

export type Crumb = {
  label: string
  href?: string
}

export function Breadcrumbs({
  items,
  label = 'Breadcrumb',
  className,
}: {
  items: Crumb[]
  label?: string
  className?: string
}) {
  if (items.length === 0) return null

  return (
    <nav
      className={cn(
        'mb-5 flex flex-wrap items-center gap-2 text-[13px] max-[700px]:mb-4 max-[700px]:text-xs',
        className,
      )}
      aria-label={label}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
            {index > 0 ? (
              <span aria-hidden className="text-muted">
                /
              </span>
            ) : null}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="font-semibold text-forest no-underline transition-opacity hover:opacity-80"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(isLast ? 'font-medium text-ink' : 'text-muted')}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
