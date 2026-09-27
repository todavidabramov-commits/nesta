import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { getViewingsView } from '@/cms/queries'
import { ViewingsLive } from '@/components/live/ViewingsLive'
import { getLocale } from '@/i18n/get-locale'
import { getMessages } from '@/i18n/messages'
import { getCustomerSession } from '@/lib/customer-auth'

export async function generateMetadata(): Promise<Metadata> {
  const t = getMessages(await getLocale()).viewings
  return {
    title: t.title,
    description: t.lead,
  }
}

export default async function ViewingsPage() {
  const locale = await getLocale()
  const customer = await getCustomerSession()
  if (!customer) redirect('/sign-in')

  const view = await getViewingsView(locale, customer.id)
  return <ViewingsLive initial={view} />
}
