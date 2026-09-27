import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { SignInLive } from '@/components/live/SignInLive'
import { getLocale } from '@/i18n/get-locale'
import { getMessages } from '@/i18n/messages'
import { getCustomerSession } from '@/lib/customer-auth'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function one(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

function safeNext(value: string | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/dashboard'
  return value
}

export async function generateMetadata(): Promise<Metadata> {
  const t = getMessages(await getLocale()).signIn
  return {
    title: t.title,
  }
}

export default async function SignInPage({ searchParams }: Props) {
  const params = await searchParams
  const next = safeNext(one(params.next))
  const customer = await getCustomerSession()
  if (customer) redirect(next)
  return <SignInLive next={next} />
}
