'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  COMPARE_MAX,
  COMPARE_MIN,
  COMPARE_STORAGE_KEY,
  compareHref,
  normalizeCompareSlugs,
} from '@/lib/compare'

type CompareContextValue = {
  slugs: string[]
  count: number
  canCompare: boolean
  isFull: boolean
  href: string
  has: (slug: string) => boolean
  toggle: (slug: string) => void
  remove: (slug: string) => void
  clear: () => void
  setSlugs: (slugs: string[]) => void
}

const CompareContext = createContext<CompareContextValue | null>(null)

function readStored(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(COMPARE_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return normalizeCompareSlugs(parsed.map(String))
  } catch {
    return []
  }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugsState] = useState<string[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setSlugsState(readStored())
    setReady(true)
  }, [])

  const setSlugs = useCallback((next: string[]) => {
    const normalized = normalizeCompareSlugs(next)
    setSlugsState(normalized)
    try {
      window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(normalized))
    } catch {
      /* ignore quota */
    }
  }, [])

  const toggle = useCallback(
    (slug: string) => {
      setSlugsState((prev) => {
        const has = prev.includes(slug)
        const next = has
          ? prev.filter((s) => s !== slug)
          : prev.length >= COMPARE_MAX
            ? prev
            : [...prev, slug]
        const normalized = normalizeCompareSlugs(next)
        try {
          window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(normalized))
        } catch {
          /* ignore */
        }
        return normalized
      })
    },
    [],
  )

  const remove = useCallback(
    (slug: string) => {
      setSlugs(slugs.filter((s) => s !== slug))
    },
    [setSlugs, slugs],
  )

  const clear = useCallback(() => setSlugs([]), [setSlugs])

  const value = useMemo<CompareContextValue>(
    () => ({
      slugs: ready ? slugs : [],
      count: ready ? slugs.length : 0,
      canCompare: ready && slugs.length >= COMPARE_MIN,
      isFull: ready && slugs.length >= COMPARE_MAX,
      href: compareHref(slugs),
      has: (slug) => slugs.includes(slug),
      toggle,
      remove,
      clear,
      setSlugs,
    }),
    [ready, slugs, toggle, remove, clear, setSlugs],
  )

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) {
    throw new Error('useCompare must be used within CompareProvider')
  }
  return ctx
}
