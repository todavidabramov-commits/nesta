import { notFound } from 'next/navigation'

import { getAgentDetailView, getPropertyBySlug } from '@/cms/queries'
import { AgentLive } from '@/components/live/AgentLive'
import { getLocale } from '@/i18n/get-locale'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

export default async function AgentPage({ params, searchParams }: Props) {
  const { slug } = await params
  const locale = await getLocale()
  const view = await getAgentDetailView(locale, slug)
  if (!view) notFound()

  const query = await searchParams
  const fromSlug = firstParam(query.from)?.trim()
  const via = firstParam(query.via)?.trim()
  const fromProperty =
    fromSlug && /^[a-z0-9-]+$/i.test(fromSlug)
      ? await getPropertyBySlug(locale, fromSlug)
      : null

  return (
    <AgentLive
      initial={view}
      fromProperty={fromProperty}
      fromViewing={via === 'viewing'}
    />
  )
}
