'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import { getMessages, type Messages } from '@/i18n/messages'

type LocaleContextValue = {
  locale: Locale
  messages: Messages
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo(
    () => ({ locale, messages: getMessages(locale) }),
    [locale],
  )
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const value = useContext(LocaleContext)
  if (!value) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return value
}
