import { notFound } from 'next/navigation'

import { getPropertyDetailView } from '@/cms/queries'
import { PropertyLive } from '@/components/live/PropertyLive'
import { getLocale } from '@/i18n/get-locale'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params
  const locale = await getLocale()
  const view = await getPropertyDetailView(locale, slug)
  if (!view) notFound()
  return <PropertyLive initial={view} />
}
