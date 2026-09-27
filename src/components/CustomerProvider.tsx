'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'

import type { CustomerSession } from '@/lib/customer-auth'

type CustomerContextValue = {
  customer: CustomerSession | null
}

const CustomerContext = createContext<CustomerContextValue>({ customer: null })

export function CustomerProvider({
  customer,
  children,
}: {
  customer: CustomerSession | null
  children: ReactNode
}) {
  const value = useMemo(() => ({ customer }), [customer])
  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>
}

export function useCustomer() {
  return useContext(CustomerContext)
}
