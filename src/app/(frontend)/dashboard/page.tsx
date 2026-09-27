import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { getDashboardView } from '@/cms/queries'
import { DashboardLive } from '@/components/live/DashboardLive'
import { getLocale } from '@/i18n/get-locale'
import { getMessages } from '@/i18n/messages'
import { getCustomerSession } from '@/lib/customer-auth'
import { isDashboardSectionId } from '@/lib/dashboard-section'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata(): Promise<Metadata> {
  const t = getMessages(await getLocale()).dashboard
  return {
    title: t.nav.overview,
  }
}

export default async function DashboardPage({ searchParams }: Props) {
  const locale = await getLocale()
  const customer = await getCustomerSession()
  if (!customer) redirect('/sign-in')

  const params = await searchParams
  const raw = params.section
  const sectionValue = Array.isArray(raw) ? raw[0] : raw
  const initialSection = isDashboardSectionId(sectionValue) ? sectionValue : 'overview'

  const view = await getDashboardView(locale, customer.favoriteIds, customer.id)
  return <DashboardLive initial={view} customer={customer} initialSection={initialSection} />
}
