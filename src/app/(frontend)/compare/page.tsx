import { getCompareView } from '@/cms/queries'
import { CompareLive } from '@/components/live/CompareLive'
import { getLocale } from '@/i18n/get-locale'

type SearchParams = Record<string, string | string[] | undefined>

function parseSlugs(params: SearchParams): string[] {
  const raw = params.p
  if (!raw) return []
  if (Array.isArray(raw)) return raw.flatMap((v) => v.split(',')).map((s) => s.trim()).filter(Boolean)
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const locale = await getLocale()
  const params = await searchParams
  const view = await getCompareView(locale, parseSlugs(params))
  return <CompareLive initial={view} />
}
