'use client'

import L from 'leaflet'
import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'

import 'leaflet/dist/leaflet.css'

type PropertyLocationMapProps = {
  latitude: number
  longitude: number
  label: string
}

function FitOnce({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, 15, { animate: false })
    map.invalidateSize({ animate: false })
    const frame = map.getContainer()
    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => map.invalidateSize({ animate: false }))
        : null
    if (frame) observer?.observe(frame)
    return () => observer?.disconnect()
  }, [center, map])
  return null
}

function pinIcon() {
  return L.divIcon({
    className: 'property-location-map__pin-wrap',
    html: '<span class="property-location-map__pin"></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

export function PropertyLocationMap({ latitude, longitude, label }: PropertyLocationMapProps) {
  const center: [number, number] = [
    Number.isFinite(latitude) ? latitude : 52.3676,
    Number.isFinite(longitude) ? longitude : 4.9041,
  ]

  return (
    <div className="property-location-map" aria-label={label}>
      <MapContainer
        className="property-location-map__leaflet"
        center={center}
        zoom={15}
        scrollWheelZoom={false}
        dragging
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitOnce center={center} />
        <Marker position={center} icon={pinIcon()} />
      </MapContainer>
    </div>
  )
}
