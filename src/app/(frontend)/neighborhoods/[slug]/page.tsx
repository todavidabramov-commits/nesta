import { notFound } from 'next/navigation'

import { getNeighborhoodDetailView } from '@/cms/queries'
import { NeighborhoodLive } from '@/components/live/NeighborhoodLive'
import { getLocale } from '@/i18n/get-locale'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function NeighborhoodPage({ params }: Props) {
  const { slug } = await params
  const locale = await getLocale()
  const view = await getNeighborhoodDetailView(locale, slug)
  if (!view) notFound()
  return <NeighborhoodLive initial={view} />
}
