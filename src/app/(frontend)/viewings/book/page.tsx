import { redirect } from 'next/navigation'

import { getBookViewingView } from '@/cms/queries'
import { BookViewingLive } from '@/components/live/BookViewingLive'
import { getLocale } from '@/i18n/get-locale'
import { getCustomerSession } from '@/lib/customer-auth'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function one(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

export default async function BookViewingPage({ searchParams }: Props) {
  const locale = await getLocale()
  const customer = await getCustomerSession()
  const params = await searchParams
  const property = one(params.property) || one(params.slug)
  const date = one(params.date)
  const time = one(params.time)

  if (!customer) {
    const q = new URLSearchParams()
    if (property) q.set('property', property)
    if (date) q.set('date', date)
    if (time) q.set('time', time)
    const next = q.toString() ? `/viewings/book?${q}` : '/viewings/book'
    redirect(`/sign-in?next=${encodeURIComponent(next)}`)
  }

  const view = await getBookViewingView(locale, {
    propertySlug: property,
    date,
    time,
  })
  return <BookViewingLive initial={view} />
}
