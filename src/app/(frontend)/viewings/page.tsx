import { getBookViewingView } from '@/cms/queries'
import { BookViewingLive } from '@/components/live/BookViewingLive'
import { getLocale } from '@/i18n/get-locale'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function one(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

export default async function ViewingsPage({ searchParams }: Props) {
  const locale = await getLocale()
  const params = await searchParams
  const view = await getBookViewingView(locale, {
    propertySlug: one(params.property) || one(params.slug),
    date: one(params.date),
    time: one(params.time),
  })
  return <BookViewingLive initial={view} />
}
