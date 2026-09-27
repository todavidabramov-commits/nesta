import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { getFavoritesView } from '@/cms/queries'
import { FavoritesLive } from '@/components/live/FavoritesLive'
import { getLocale } from '@/i18n/get-locale'
import { getMessages } from '@/i18n/messages'
import { getCustomerSession } from '@/lib/customer-auth'

export async function generateMetadata(): Promise<Metadata> {
  const t = getMessages(await getLocale()).favorites
  return {
    title: t.title,
    description: t.lead,
  }
}

export default async function FavoritesPage() {
  const locale = await getLocale()
  const customer = await getCustomerSession()
  if (!customer) redirect('/sign-in')

  const view = await getFavoritesView(locale, customer.favoriteIds)
  return <FavoritesLive initial={view} />
}
