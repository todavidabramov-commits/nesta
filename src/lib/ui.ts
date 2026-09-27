/** Shared Tailwind class strings for hybrid migration */

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

/** Centered page column — same gutter as SiteHeader / SiteFooter / search */
export const pageShell = 'mx-auto w-full max-w-page px-[var(--page-pad)] box-border'

export const btn = {
  base: 'inline-flex items-center justify-center rounded-sm cursor-pointer transition-opacity duration-150 hover:opacity-[0.92]',
  primary: 'border-0 bg-forest !text-surface font-bold',
  outline:
    'border border-forest bg-transparent !text-forest font-bold gap-2 hover:bg-forest/5',
  sm: 'px-4 py-[10px] text-[12px]',
  block: 'w-full px-4 py-3.5 text-sm font-bold shadow-[0_4px_6px_rgba(0,0,0,0.08)]',
} as const

export function btnClass(...variants: Array<'primary' | 'outline' | 'sm' | 'block'>) {
  return cn(btn.base, ...variants.map((v) => btn[v]))
}
