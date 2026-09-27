import { getNeighborhoodsDirectoryView } from '@/cms/queries'
import { NeighborhoodsDirectoryLive } from '@/components/live/NeighborhoodsDirectoryLive'
import { getLocale } from '@/i18n/get-locale'

export default async function NeighborhoodsPage() {
  const locale = await getLocale()
  const view = await getNeighborhoodsDirectoryView(locale)
  return <NeighborhoodsDirectoryLive initial={view} />
}
