import { getMatchingView } from '@/cms/queries'
import { SmartMatchingLive } from '@/components/live/SmartMatchingLive'
import { getLocale } from '@/i18n/get-locale'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function MatchingPage({ searchParams }: Props) {
  const locale = await getLocale()
  const view = await getMatchingView(locale)
  const initialQuery = await searchParams
  return <SmartMatchingLive initial={view} initialQuery={initialQuery} />
}
