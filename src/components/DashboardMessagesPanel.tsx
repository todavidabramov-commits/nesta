'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

import {
  markAllCustomerMessagesRead,
  markCustomerMessageRead,
} from '@/app/(frontend)/actions/messages'
import type { CustomerMessageView } from '@/cms/types'
import { useLocale } from '@/i18n/locale-context'
import { btnClass, cn } from '@/lib/ui'

export function DashboardMessagesPanel({
  initial,
  onChange,
}: {
  initial: CustomerMessageView[]
  onChange?: (next: CustomerMessageView[]) => void
}) {
  const router = useRouter()
  const { messages } = useLocale()
  const t = messages.dashboard.messagesSection
  const [items, setItems] = useState(initial)
  const [expandedId, setExpandedId] = useState<string | null>(
    initial.find((item) => !item.read)?.id || initial[0]?.id || null,
  )
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    setItems(initial)
  }, [initial])

  const unreadCount = items.filter((item) => !item.read).length

  function commit(next: CustomerMessageView[]) {
    setItems(next)
    onChange?.(next)
  }

  function openMessage(item: CustomerMessageView) {
    setExpandedId(item.id)
    if (item.read) return

    const snapshot = items
    const next = items.map((row) => (row.id === item.id ? { ...row, read: true } : row))
    commit(next)
    startTransition(async () => {
      const result = await markCustomerMessageRead(item.id)
      if (!result.ok) {
        commit(snapshot)
        return
      }
      router.refresh()
    })
  }

  function markAllRead() {
    if (unreadCount === 0 || pending) return
    const snapshot = items
    commit(items.map((row) => ({ ...row, read: true })))
    startTransition(async () => {
      const result = await markAllCustomerMessagesRead()
      if (!result.ok) {
        commit(snapshot)
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
        {unreadCount > 0 ? (
          <button
            type="button"
            disabled={pending}
            onClick={markAllRead}
            className={cn(
              btnClass('outline', 'sm'),
              'px-4 py-2 text-xs disabled:opacity-50 min-[901px]:text-[13px]',
            )}
          >
            {t.markAllRead}
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="rounded-[10px] border border-line bg-surface p-6">
          <p className="m-0 text-sm leading-relaxed text-muted">{t.empty}</p>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {items.map((item) => {
            const open = expandedId === item.id
            return (
              <li key={item.id}>
                <article
                  className={cn(
                    'rounded-[10px] border bg-surface transition-colors',
                    item.read ? 'border-line' : 'border-forest/30 bg-[#f4f7f4]',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => openMessage(item)}
                    className="flex w-full items-start gap-3 border-0 bg-transparent px-4 py-4 text-left min-[901px]:px-5 min-[901px]:py-5"
                  >
                    <span
                      className={cn(
                        'mt-1.5 size-2 shrink-0 rounded-full',
                        item.read ? 'bg-line' : 'bg-forest',
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span
                          className={cn(
                            'text-sm text-ink',
                            item.read ? 'font-semibold' : 'font-bold',
                          )}
                        >
                          {item.title}
                        </span>
                        {!item.read ? (
                          <span className="rounded bg-forest px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-surface">
                            {t.unread}
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-muted">{t.read}</span>
                        )}
                      </span>
                      {item.createdLabel ? (
                        <span className="mt-1 block text-xs text-muted">{item.createdLabel}</span>
                      ) : null}
                      {open ? (
                        <span className="mt-3 block whitespace-pre-wrap text-[13px] leading-relaxed text-ink min-[901px]:text-sm">
                          {item.body}
                        </span>
                      ) : (
                        <span className="mt-1.5 block truncate text-[13px] text-muted">
                          {item.body}
                        </span>
                      )}
                    </span>
                  </button>
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
