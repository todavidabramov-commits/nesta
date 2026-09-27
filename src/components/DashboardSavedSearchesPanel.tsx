'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

import { deleteSavedSearch } from '@/app/(frontend)/actions/saved-searches'
import type { SavedSearchView } from '@/cms/types'
import { useLocale } from '@/i18n/locale-context'
import { btnClass, cn } from '@/lib/ui'

export function DashboardSavedSearchesPanel({
  initial,
}: {
  initial: SavedSearchView[]
}) {
  const router = useRouter()
  const { messages } = useLocale()
  const t = messages.dashboard.savedSearches
  const [items, setItems] = useState(initial)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    setItems(initial)
  }, [initial])

  function onDelete(id: string) {
    if (pending) return
    const snapshot = items
    setItems((prev) => prev.filter((item) => item.id !== id))
    setPendingId(id)
    startTransition(async () => {
      const result = await deleteSavedSearch(id)
      setPendingId(null)
      if (!result.ok) {
        setItems(snapshot)
        return
      }
      router.refresh()
    })
  }

  return (
    <section className="flex max-w-3xl flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 font-display text-[28px] font-normal leading-none text-ink min-[901px]:text-[36px]">
            {t.title}
          </h1>
          <p className="m-0 text-[13px] text-muted min-[901px]:text-sm">{t.lead}</p>
        </div>
        <Link
          href="/matching"
          className={cn(btnClass('outline', 'sm'), 'px-4 py-2 text-xs no-underline min-[901px]:text-[13px]')}
        >
          {t.newSearch}
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col gap-4 rounded-[10px] border border-line bg-surface p-6">
          <p className="m-0 text-sm leading-relaxed text-muted">{t.empty}</p>
          <Link
            href="/matching"
            className={cn(btnClass('primary', 'sm'), 'self-start px-4 py-2.5 text-[13px] no-underline')}
          >
            {t.startMatching}
          </Link>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 rounded-[10px] border border-line bg-surface p-4 min-[901px]:flex-row min-[901px]:items-center min-[901px]:justify-between min-[901px]:gap-4 min-[901px]:p-5"
            >
              <div className="min-w-0 flex-1">
                <p className="m-0 text-sm font-bold text-ink">{item.title}</p>
                <p className="m-0 mt-1 text-[13px] leading-snug text-muted">{item.detail}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  href={item.href}
                  className={cn(
                    btnClass('primary', 'sm'),
                    'px-4 py-2 text-xs no-underline min-[901px]:text-[13px]',
                  )}
                >
                  {t.open}
                </Link>
                <button
                  type="button"
                  disabled={pending && pendingId === item.id}
                  onClick={() => onDelete(item.id)}
                  className={cn(
                    'rounded-sm border border-line bg-transparent px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-[#c45c4a] hover:text-[#8b3a2f] disabled:opacity-50 min-[901px]:text-[13px]',
                  )}
                >
                  {t.remove}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
