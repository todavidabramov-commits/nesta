'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'

import { toggleFavorite } from '@/app/(frontend)/actions/favorites'
import { useCustomer } from '@/components/CustomerProvider'
import { useLocale } from '@/i18n/locale-context'

type FavoritesContextValue = {
  ids: Set<string>
  count: number
  has: (propertyId: string) => boolean
  toggle: (propertyId: string) => void
  pending: boolean
  isAuthenticated: boolean
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { messages } = useLocale()
  const { customer } = useCustomer()
  const t = messages.favorites
  const serverKey = customer?.favoriteIds?.join(',') ?? ''
  const [ids, setIds] = useState<Set<string>>(() => new Set(customer?.favoriteIds ?? []))
  const [pending, setPending] = useState(false)
  const idsRef = useRef(ids)

  useEffect(() => {
    idsRef.current = ids
  }, [ids])

  useEffect(() => {
    setIds(new Set(serverKey ? serverKey.split(',') : []))
  }, [customer?.id, serverKey])

  const has = useCallback((propertyId: string) => ids.has(String(propertyId)), [ids])

  const toggle = useCallback(
    (propertyId: string) => {
      const id = String(propertyId || '').trim()
      if (!id || pending) return

      if (!customer) {
        toast(t.toastSignInTitle, {
          description: t.toastSignInDescription,
          action: {
            label: t.toastSignInAction,
            onClick: () => router.push('/sign-in'),
          },
        })
        router.push('/sign-in')
        return
      }

      const previous = new Set(idsRef.current)
      const adding = !previous.has(id)
      const next = new Set(previous)
      if (adding) next.add(id)
      else next.delete(id)
      setIds(next)
      setPending(true)

      void (async () => {
        try {
          const result = await toggleFavorite(id)
          if (!result.ok) {
            setIds(previous)
            if (result.error === 'auth') {
              toast(t.toastSignInTitle, {
                description: t.toastSignInDescription,
                action: {
                  label: t.toastSignInAction,
                  onClick: () => router.push('/sign-in'),
                },
              })
              router.push('/sign-in')
              return
            }
            toast.error(t.toastError)
            return
          }
          setIds(new Set(result.favoriteIds.map(String)))
          toast.success(adding ? t.toastAdded : t.toastRemoved, {
            description: adding ? t.toastAddedDescription : t.toastRemovedDescription,
            icon: <Heart className="size-4 fill-current" strokeWidth={1.8} aria-hidden />,
          })
          router.refresh()
        } catch {
          setIds(previous)
          toast.error(t.toastError)
        } finally {
          setPending(false)
        }
      })()
    },
    [customer, pending, router, t],
  )

  const value = useMemo(
    () => ({
      ids,
      count: ids.size,
      has,
      toggle,
      pending,
      isAuthenticated: Boolean(customer),
    }),
    [ids, has, toggle, pending, customer],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const value = useContext(FavoritesContext)
  if (!value) {
    throw new Error('useFavorites must be used within FavoritesProvider')
  }
  return value
}
