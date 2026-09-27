import { getMatchingView } from '@/cms/queries'
import { SmartMatchingLive } from '@/components/live/SmartMatchingLive'
import { getLocale } from '@/i18n/get-locale'

export default async function MatchingPage() {
  const locale = await getLocale()
  const view = await getMatchingView(locale)
  return <SmartMatchingLive initial={view} />
}
