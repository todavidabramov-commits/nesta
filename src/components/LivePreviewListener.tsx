'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

import type { CmsDoc } from '@/cms/map'
import { mediaId, mediaUrl } from '@/cms/utils'

type LiveEvent = {
  collectionSlug?: string
  globalSlug?: string
  data: CmsDoc
}

const UPLOAD_FIELDS = ['cover', 'heroImage'] as const

const LivePreviewContext = createContext<LiveEvent | null>(null)

export function useLivePreviewEvent() {
  return useContext(LivePreviewContext)
}

export function useLiveCollection<T>(
  slug: string,
  initial: T,
  map: (doc: CmsDoc, initial: T) => T,
): T {
  const event = useLivePreviewEvent()
  if (!event?.collectionSlug || event.collectionSlug !== slug) return initial
  return map(event.data, initial)
}

export function useLiveCollectionList<T>(
  slug: string,
  items: T[],
  map: (doc: CmsDoc, initial: T) => T,
  keyOf: (item: T) => string,
): T[] {
  const event = useLivePreviewEvent()
  if (!event?.collectionSlug || event.collectionSlug !== slug || items.length === 0) return items
  const live = map(event.data, items[0])
  const key = keyOf(live)
  if (!key) return items
  let found = false
  const next = items.map((item) => {
    if (keyOf(item) !== key) return item
    found = true
    return map(event.data, item)
  })
  return found ? next : items
}

export function useLiveGlobalEvent() {
  return useLivePreviewEvent()
}

async function populateUploads(data: CmsDoc): Promise<CmsDoc> {
  const next = { ...data }

  async function hydrate(key: string, value: unknown) {
    if (mediaUrl(value)) return value
    const id = mediaId(value)
    if (id == null) return value
    const response = await fetch(`/api/media/${id}?depth=0`, { credentials: 'include' })
    if (!response.ok) return value
    const json = (await response.json()) as unknown
    if (json && typeof json === 'object' && ('url' in json || 'filename' in json || 'id' in json)) {
      return json as CmsDoc
    }
    return value
  }

  await Promise.all(
    UPLOAD_FIELDS.map(async (key) => {
      if (key in next) {
        next[key] = await hydrate(key, next[key])
      }
    }),
  )

  if (next.hero && typeof next.hero === 'object') {
    const hero = { ...(next.hero as CmsDoc) }
    if ('heroImage' in hero) {
      hero.heroImage = await hydrate('heroImage', hero.heroImage)
    }
    next.hero = hero
  }

  return next
}

export function LivePreviewListener({ children }: { children?: ReactNode }) {
  const router = useRouter()
  const [serverURL, setServerURL] = useState('')
  const [listening, setListening] = useState(false)
  const [event, setEvent] = useState<LiveEvent | null>(null)
  const requestId = useRef(0)

  useEffect(() => {
    setServerURL(window.location.origin)
  }, [])

  useLayoutEffect(() => {
    if (!serverURL) return
    const onMessage = (message: MessageEvent) => {
      const payload = message.data as {
        type?: string
        ready?: boolean
        collectionSlug?: string
        globalSlug?: string
        data?: CmsDoc
      }
      if (message.origin !== serverURL) return
      if (!payload || payload.type !== 'payload-live-preview' || payload.ready) return
      if (!payload.data || typeof payload.data !== 'object') return
      if (!payload.collectionSlug && !payload.globalSlug) return

      const nextEvent = {
        collectionSlug: payload.collectionSlug,
        globalSlug: payload.globalSlug,
        data: payload.data,
      }
      setEvent(nextEvent)

      const current = ++requestId.current
      void populateUploads(payload.data).then((data) => {
        if (current !== requestId.current) return
        setEvent({ ...nextEvent, data })
      })
    }
    window.addEventListener('message', onMessage)
    setListening(true)
    return () => {
      window.removeEventListener('message', onMessage)
      setListening(false)
    }
  }, [serverURL])

  return (
    <LivePreviewContext.Provider value={event}>
      {listening ? <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={serverURL} /> : null}
      {children}
    </LivePreviewContext.Provider>
  )
}
