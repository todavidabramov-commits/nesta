import type { Metadata } from 'next'
import React from 'react'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { CompareProvider } from '@/components/CompareProvider'
import { getLocale } from '@/i18n/get-locale'
import { LocaleProvider } from '@/i18n/locale-context'
import { getMessages } from '@/i18n/messages'

import '@/tailwind.css'
import './styles.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const t = getMessages(await getLocale())
  return {
    title: {
      default: t.meta.siteTitle,
      template: t.meta.template,
    },
    description: t.meta.description,
  }
}

export const viewport = {
  themeColor: '#163324',
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:wght@500;600;700&family=Schibsted+Grotesk:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LocaleProvider locale={locale}>
          <CompareProvider>
            <LivePreviewListener>{children}</LivePreviewListener>
          </CompareProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
