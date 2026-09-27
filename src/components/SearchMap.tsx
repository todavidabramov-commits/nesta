'use client'

import L from 'leaflet'
import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'

import type { PropertyView } from '@/cms/types'
import { PropertyCard } from '@/components/PropertyCard'
import { formatCompactPrice } from '@/lib/format-price'

import 'leaflet/dist/leaflet.css'

const AMSTERDAM: [number, number] = [52.3676, 4.9041]

function hasCoords(property: PropertyView): boolean {
  return Number.isFinite(property.latitude) && Number.isFinite(property.longitude)
}

function coordsOf(property: PropertyView): [number, number] {
  return hasCoords(property) ? [property.latitude, property.longitude] : AMSTERDAM
}

function mapIsReady(map: L.Map): boolean {
  const size = map.getSize()
  return size.x > 0 && size.y > 0 && Number.isFinite(map.getZoom())
}

function safeZoom(map: L.Map, min = 13): number {
  const zoom = map.getZoom()
  return Number.isFinite(zoom) ? Math.max(zoom, min) : min
}

type SearchMapProps = {
  properties: PropertyView[]
  activeSlug: string
  onSelect: (slug: string) => void
  locale: string
  bedroomsOne: string
  bedroomsMany: string
  mapLabel: string
}

function MapCamera({
  properties,
  activeSlug,
}: {
  properties: PropertyView[]
  activeSlug: string
}) {
  const map = useMap()
  const listKey = properties.map((property) => property.slug).join('|')
  const prevListKey = useRef<string | null>(null)
  const skipNextFly = useRef(true)

  useEffect(() => {
    const refresh = () => {
      map.invalidateSize({ animate: false })
    }
    refresh()
    map.whenReady(refresh)
    window.addEventListener('resize', refresh)
    const frame = map.getContainer()
    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => refresh()) : null
    if (frame) observer?.observe(frame)
    return () => {
      window.removeEventListener('resize', refresh)
      observer?.disconnect()
    }
  }, [map])

  useEffect(() => {
    if (prevListKey.current === listKey) return
    if (!mapIsReady(map)) return

    prevListKey.current = listKey
    skipNextFly.current = true

    const mappable = properties.filter(hasCoords)
    if (mappable.length === 0) {
      map.setView(AMSTERDAM, 12)
      return
    }
    if (mappable.length === 1) {
      map.setView(coordsOf(mappable[0]), 14)
      return
    }

    const bounds = L.latLngBounds(mappable.map((property) => coordsOf(property)))
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 })
  }, [listKey, map, properties])

  useEffect(() => {
    const active = properties.find((property) => property.slug === activeSlug)
    if (!active || !hasCoords(active)) return

    if (skipNextFly.current) {
      skipNextFly.current = false
      return
    }

    if (!mapIsReady(map)) return

    const next = coordsOf(active)
    if (!Number.isFinite(next[0]) || !Number.isFinite(next[1])) return

    map.flyTo(next, safeZoom(map), {
      duration: 0.85,
      easeLinearity: 0.2,
    })
  }, [activeSlug, map, properties])

  return null
}

function priceIcon(label: string, active: boolean) {
  return L.divIcon({
    className: 'search-map__pin-wrap',
    html: `<span class="search-map__pin${active ? ' is-active' : ''}">${label}</span>`,
    iconSize: [1, 1],
    iconAnchor: [0, 0],
  })
}

export function SearchMap({
  properties,
  activeSlug,
  onSelect,
  locale,
  bedroomsOne,
  bedroomsMany,
  mapLabel,
}: SearchMapProps) {
  const active = properties.find((property) => property.slug === activeSlug) || null
  const mappable = useMemo(() => properties.filter(hasCoords), [properties])

  const center = useMemo((): [number, number] => {
    if (active && hasCoords(active)) return coordsOf(active)
    return mappable[0] ? coordsOf(mappable[0]) : AMSTERDAM
  }, [active, mappable])

  return (
    <aside className="search-map" aria-label={mapLabel}>
      <div className="search-map__frame">
        <MapContainer
          className="search-map__leaflet"
          center={center}
          zoom={13}
          scrollWheelZoom
          zoomControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapCamera properties={mappable} activeSlug={activeSlug} />
          {mappable.map((property) => {
            const isActive = Boolean(active && property.slug === active.slug)
            const label = formatCompactPrice(property.price, locale, property.listingType)
            return (
              <Marker
                key={property.slug}
                position={coordsOf(property)}
                icon={priceIcon(label, isActive)}
                zIndexOffset={isActive ? 1000 : 0}
                eventHandlers={{
                  click: () => onSelect(property.slug),
                }}
              />
            )
          })}
        </MapContainer>

        {active ? (
          <div className="search-map__preview">
            <PropertyCard
              property={active}
              locale={locale}
              bedroomsOne={bedroomsOne}
              bedroomsMany={bedroomsMany}
              variant="map"
            />
          </div>
        ) : null}
      </div>
    </aside>
  )
}
