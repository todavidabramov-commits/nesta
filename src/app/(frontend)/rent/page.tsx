import { getSearchView } from '@/cms/queries'
import { SearchLive } from '@/components/live/SearchLive'
import { getLocale } from '@/i18n/get-locale'
import { parseSearchParams } from '@/lib/search-params'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function RentPage({ searchParams }: Props) {
  const locale = await getLocale()
  const params = await searchParams
  const filters = parseSearchParams('rent', params)
  const view = await getSearchView(locale, filters)
  return <SearchLive initial={view} basePath="/rent" />
}
