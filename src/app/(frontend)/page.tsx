import { getHomeView } from '@/cms/queries'
import { HomeLive } from '@/components/live/HomeLive'
import { getLocale } from '@/i18n/get-locale'

export default async function HomePage() {
  const locale = await getLocale()
  const home = await getHomeView(locale)
  return <HomeLive initial={home} />
}
