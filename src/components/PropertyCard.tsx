'use client'

import { Heart, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import type { PropertyView } from '@/cms/types'
import { isCmsMedia } from '@/cms/utils'
import { useCompare } from '@/components/CompareProvider'
import { useFavorites } from '@/components/FavoritesProvider'
import { useLocale } from '@/i18n/locale-context'
import { formatPropertyPrice } from '@/lib/format-price'
import { cn } from '@/lib/ui'

function bedroomsLabel(count: number, locale: string, one: string, many: string) {
  const template = locale === 'ru' && count === 1 ? one : locale === 'en' && count === 1 ? one : many
  return template.replace('{count}', String(count))
}

export function PropertyCard({
  property,
  locale,
  bedroomsOne,
  bedroomsMany,
  variant = 'grid',
  compact = false,
  showCompare = false,
  onShowOnMap,
  mapActive = false,
}: {
  property: PropertyView
  locale: string
  bedroomsOne: string
  bedroomsMany: string
  variant?: 'grid' | 'search' | 'map'
  compact?: boolean
  showCompare?: boolean
  onShowOnMap?: () => void
  mapActive?: boolean
}) {
  const unoptimized = property.coverUrl ? isCmsMedia(property.coverUrl) : true
  const { messages } = useLocale()
  const compare = useCompare()
  const favorites = useFavorites()
  const selected = compare.has(property.slug)
  const blocked = !selected && compare.isFull
  const showActions = (showCompare || onShowOnMap) && variant !== 'map'
  const favorited = favorites.has(property.id)
  const showFavorite = favorites.isAuthenticated

  return (
    <div
      className={cn(
        'property-card group relative flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-[0_4px_12px_rgba(0,0,0,0.03)] max-[700px]:rounded-md',
        variant === 'search' && 'w-full',
        variant === 'map' && 'property-card--map shadow-[0_12px_24px_rgba(0,0,0,0.08)]',
        selected && showCompare && 'border-forest',
      )}
    >
      {showFavorite ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            favorites.toggle(property.id)
          }}
          className={cn(
            'absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-full border-0 shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-colors',
            favorited
              ? 'bg-forest text-surface'
              : 'bg-surface/95 text-forest hover:bg-surface',
            variant === 'map' && 'right-2 top-2 size-8',
          )}
          aria-label={favorited ? messages.favorites.remove : messages.favorites.add}
          aria-pressed={favorited}
        >
          <Heart
            className={cn(variant === 'map' ? 'size-4' : 'size-[18px]', favorited && 'fill-current')}
            strokeWidth={1.8}
            aria-hidden
          />
        </button>
      ) : null}

      <Link href={`/properties/${property.slug}`} className="flex min-h-0 flex-1 flex-col text-inherit no-underline">
        <div
          className={cn(
            'relative w-full overflow-hidden bg-line',
            variant === 'map'
              ? 'h-[140px]'
              : compact
                ? 'h-[180px] max-[700px]:h-[110px]'
                : 'h-[180px] max-[700px]:h-40',
          )}
        >
          {property.coverUrl ? (
            <Image
              src={property.coverUrl}
              alt={property.coverAlt || property.title}
              fill
              className="object-cover"
              sizes={
                variant === 'search'
                  ? '(max-width: 700px) 100vw, 420px'
                  : variant === 'map'
                    ? '(max-width: 700px) 220px, 300px'
                    : compact
                      ? '(max-width: 700px) 50vw, 25vw'
                      : '(max-width: 900px) 100vw, 25vw'
              }
              unoptimized={unoptimized}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#e7e1d7] to-[#d9d0c3]" />
          )}
        </div>
        <div
          className={cn(
            'flex flex-col gap-2 p-4',
            variant === 'map' && 'gap-1 p-3',
            compact && 'max-[700px]:gap-1 max-[700px]:p-2.5',
            showActions && 'pb-3',
          )}
        >
          <p
            className={cn(
              'm-0 text-xs font-bold uppercase tracking-[0.04em] text-accent',
              compact && 'max-[700px]:text-[10px]',
            )}
          >
            {property.neighborhood}
          </p>
          <h3
            className={cn(
              'm-0 overflow-hidden text-ellipsis whitespace-nowrap font-display font-semibold',
              variant === 'map' ? 'text-base' : 'text-lg',
              compact && 'max-[700px]:text-sm',
            )}
          >
            {property.title}
          </h3>
          <p
            className={cn(
              'm-0 font-bold',
              variant === 'map' ? 'text-sm' : 'text-base',
              compact && 'max-[700px]:text-[13px]',
            )}
          >
            {formatPropertyPrice(property.price, locale, property.listingType)}
          </p>
          {variant !== 'map' ? (
            <div
              className={cn(
                'flex gap-4 pt-1 text-xs text-muted',
                compact && 'max-[700px]:gap-2 max-[700px]:pt-0.5 max-[700px]:text-[10px]',
              )}
            >
              <span className="inline-flex items-center gap-1">
                <RulerIcon />
                {property.areaM2} m²
              </span>
              <span className="inline-flex items-center gap-1">
                <BedIcon />
                {bedroomsLabel(property.bedrooms, locale, bedroomsOne, bedroomsMany)}
              </span>
            </div>
          ) : null}
        </div>
      </Link>

      {showActions ? (
        <div className="flex items-center gap-2 px-4 pb-4 pt-0 max-[700px]:px-3 max-[700px]:pb-3">
          {showCompare ? (
            <button
              type="button"
              disabled={blocked}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                if (!blocked) compare.toggle(property.slug)
              }}
              className={cn(
                'inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-sm border-0 px-3 py-3 text-[12px] font-bold transition-colors',
                selected
                  ? 'bg-forest text-surface'
                  : blocked
                    ? 'cursor-not-allowed bg-[#fcfaf6] text-muted opacity-60'
                    : 'bg-[#e8efea] text-forest hover:bg-[#dce8e0]',
              )}
              aria-pressed={selected}
            >
              <CompareGlyph selected={selected} />
              {selected ? messages.search.compareSelected : messages.search.compareAdd}
            </button>
          ) : null}
          {onShowOnMap ? (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onShowOnMap()
              }}
              className={cn(
                'inline-flex size-11 shrink-0 items-center justify-center rounded-sm border-0 transition-colors',
                mapActive
                  ? 'bg-forest text-surface'
                  : 'bg-[#e8efea] text-forest hover:bg-[#dce8e0]',
              )}
              aria-label={messages.search.showOnMap}
              aria-pressed={mapActive}
              title={messages.search.showOnMap}
            >
              <MapPin className="size-[22px]" strokeWidth={1.8} aria-hidden />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function CompareGlyph({ selected }: { selected: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden fill="none">
      {selected ? (
        <path
          d="M3.5 8.2 6.4 11.2 12.5 4.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <rect x="2" y="3" width="5" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" />
          <rect x="9" y="3" width="5" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" />
        </>
      )}
    </svg>
  )
}

function RulerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
      <path
        d="M4 16.5 16.5 4l3.5 3.5L7.5 20 4 16.5Zm3.2-1.1 1.4 1.4M9.5 12l1.4 1.4M12 9.5l1.4 1.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BedIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
      <path
        d="M3 18v-5.5A2.5 2.5 0 0 1 5.5 10H9V8.5A2.5 2.5 0 0 1 11.5 6h5A2.5 2.5 0 0 1 19 8.5V10h.5A1.5 1.5 0 0 1 21 11.5V18M3 14h18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
