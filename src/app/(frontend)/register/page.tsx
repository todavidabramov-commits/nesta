import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { RegisterLive } from '@/components/live/RegisterLive'
import { getLocale } from '@/i18n/get-locale'
import { getMessages } from '@/i18n/messages'
import { getCustomerSession } from '@/lib/customer-auth'

export async function generateMetadata(): Promise<Metadata> {
  const t = getMessages(await getLocale()).register
  return {
    title: t.titleDesktop,
  }
}

export default async function RegisterPage() {
  const customer = await getCustomerSession()
  if (customer) redirect('/dashboard')
  return <RegisterLive />
}
