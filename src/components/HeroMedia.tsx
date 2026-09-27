'use client'

import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'

import { useLocale } from '@/i18n/locale-context'

type HeroMediaProps = {
  src: string
  alt: string
  sizes?: string
  unoptimized?: boolean
}

const LERP = 0.055
/** Base crop is already at look-zoom; hover only pans (no extra zoom jump). */
const ZOOM_IDLE = 1.48
const ZOOM_ACTIVE = 1.48

function prefersReducedMotion() {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function isPanDisabled() {
  if (typeof window === 'undefined') return true
  return (
    window.matchMedia('(max-width: 700px)').matches ||
    window.matchMedia('(hover: none)').matches ||
    window.matchMedia('(pointer: coarse)').matches
  )
}

function clamp(value: number, min = -1, max = 1) {
  return Math.max(min, Math.min(max, value))
}

export function HeroMedia({ src, alt, sizes, unoptimized }: HeroMediaProps) {
  const { messages } = useLocale()
  const rootRef = useRef<HTMLDivElement>(null)
  const naturalRef = useRef({ w: 3840, h: 2160 })
  const baseSizeRef = useRef({ w: 0, h: 0 })
  const maxPanRef = useRef({ x: 0, y: 0 })
  const targetRef = useRef({ x: 0, y: 0, zoom: ZOOM_IDLE })
  const currentRef = useRef({ x: 0, y: 0, zoom: ZOOM_IDLE })
  const rafRef = useRef<number | null>(null)
  const dragAxisRef = useRef<'x' | 'y' | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [hintVisible, setHintVisible] = useState(true)
  const [look, setLook] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [looking, setLooking] = useState(false)

  useEffect(() => {
    const sync = () => {
      setEnabled(!prefersReducedMotion() && !isPanDisabled())
    }
    sync()
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const widthQuery = window.matchMedia('(max-width: 700px)')
    const hoverQuery = window.matchMedia('(hover: none)')
    const coarseQuery = window.matchMedia('(pointer: coarse)')
    motionQuery.addEventListener('change', sync)
    widthQuery.addEventListener('change', sync)
    hoverQuery.addEventListener('change', sync)
    coarseQuery.addEventListener('change', sync)
    return () => {
      motionQuery.removeEventListener('change', sync)
      widthQuery.removeEventListener('change', sync)
      hoverQuery.removeEventListener('change', sync)
      coarseQuery.removeEventListener('change', sync)
    }
  }, [])

  const measureBase = useEffectEvent(() => {
    const root = rootRef.current
    if (!root) return
    const cw = root.clientWidth
    const ch = root.clientHeight
    if (cw === 0 || ch === 0) return

    const { w: iw, h: ih } = naturalRef.current
    const cover = Math.max(cw / iw, ch / ih)
    const baseW = iw * cover
    const baseH = ih * cover
    baseSizeRef.current = { w: baseW, h: baseH }
    root.style.setProperty('--img-w', `${baseW.toFixed(2)}px`)
    root.style.setProperty('--img-h', `${baseH.toFixed(2)}px`)
  })

  const applyTransform = useEffectEvent((x: number, y: number, zoom: number) => {
    const root = rootRef.current
    if (!root) return

    const { w: baseW, h: baseH } = baseSizeRef.current
    const cw = root.clientWidth
    const ch = root.clientHeight
    const maxX = Math.max(0, (baseW * zoom - cw) / 2)
    const maxY = Math.max(0, (baseH * zoom - ch) / 2)
    maxPanRef.current = { x: maxX, y: maxY }

    const panX = -x * maxX
    const panY = -y * maxY

    root.style.setProperty('--pan-x', `${panX.toFixed(2)}px`)
    root.style.setProperty('--pan-y', `${panY.toFixed(2)}px`)
    root.style.setProperty('--zoom', zoom.toFixed(4))
    setLook({ x, y })
  })

  const tick = useEffectEvent(() => {
    const cur = currentRef.current
    const target = targetRef.current
    cur.x += (target.x - cur.x) * LERP
    cur.y += (target.y - cur.y) * LERP
    cur.zoom += (target.zoom - cur.zoom) * LERP

    applyTransform(cur.x, cur.y, cur.zoom)

    const settled =
      Math.abs(target.x - cur.x) < 0.0008 &&
      Math.abs(target.y - cur.y) < 0.0008 &&
      Math.abs(target.zoom - cur.zoom) < 0.0008
    if (settled) {
      cur.x = target.x
      cur.y = target.y
      cur.zoom = target.zoom
      applyTransform(cur.x, cur.y, cur.zoom)
      rafRef.current = null
      return
    }
    rafRef.current = requestAnimationFrame(tick)
  })

  const startLoop = useEffectEvent(() => {
    if (rafRef.current != null) return
    rafRef.current = requestAnimationFrame(tick)
  })

  const setTarget = useEffectEvent((x: number, y: number, zoom?: number) => {
    targetRef.current = {
      x: clamp(x),
      y: clamp(y),
      zoom: zoom ?? targetRef.current.zoom,
    }
    startLoop()
  })

  useLayoutEffect(() => {
    measureBase()
    applyTransform(currentRef.current.x, currentRef.current.y, currentRef.current.zoom)

    const root = rootRef.current
    if (!root) return

    const observer = new ResizeObserver(() => {
      measureBase()
      applyTransform(currentRef.current.x, currentRef.current.y, currentRef.current.zoom)
    })
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    if (enabled) return
    targetRef.current = { x: 0, y: 0, zoom: ZOOM_IDLE }
    currentRef.current = { x: 0, y: 0, zoom: ZOOM_IDLE }
    applyTransform(0, 0, ZOOM_IDLE)
    setHintVisible(true)
    setLooking(false)
  }, [enabled])

  const dismissHint = () => {
    setHintVisible(false)
  }

  const enterLook = () => {
    if (!enabled) return
    setLooking(true)
    targetRef.current.zoom = ZOOM_ACTIVE
    startLoop()
  }

  const exitLook = () => {
    if (!enabled || dragAxisRef.current) return
    setLooking(false)
    setTarget(0, 0, ZOOM_IDLE)
  }

  const onStagePointerEnter = () => {
    enterLook()
  }

  const onStagePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || dragAxisRef.current) return
    enterLook()
    const rect = event.currentTarget.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1
    setTarget(nx, ny, ZOOM_ACTIVE)
    dismissHint()
  }

  const onRootPointerLeave = () => {
    if (!enabled || dragAxisRef.current) return
    exitLook()
  }

  const readSliderValue = (event: React.PointerEvent<HTMLDivElement>, axis: 'x' | 'y') => {
    const rect = event.currentTarget.getBoundingClientRect()
    if (axis === 'x') {
      if (rect.width === 0) return 0
      return clamp(((event.clientX - rect.left) / rect.width) * 2 - 1)
    }
    if (rect.height === 0) return 0
    return clamp(((event.clientY - rect.top) / rect.height) * 2 - 1)
  }

  const onSliderPointerDown = (axis: 'x' | 'y') => (event: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled) return
    event.preventDefault()
    event.stopPropagation()
    dragAxisRef.current = axis
    setDragging(true)
    enterLook()
    event.currentTarget.setPointerCapture(event.pointerId)
    const value = readSliderValue(event, axis)
    if (axis === 'x') setTarget(value, targetRef.current.y, ZOOM_ACTIVE)
    else setTarget(targetRef.current.x, value, ZOOM_ACTIVE)
    dismissHint()
  }

  const onSliderPointerMove = (axis: 'x' | 'y') => (event: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || dragAxisRef.current !== axis) return
    event.stopPropagation()
    const value = readSliderValue(event, axis)
    if (axis === 'x') setTarget(value, targetRef.current.y, ZOOM_ACTIVE)
    else setTarget(targetRef.current.x, value, ZOOM_ACTIVE)
  }

  const onSliderPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragAxisRef.current) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId)
      } catch {
        /* already released */
      }
    }
    dragAxisRef.current = null
    setDragging(false)
  }

  const onImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      naturalRef.current = { w: img.naturalWidth, h: img.naturalHeight }
      measureBase()
      applyTransform(currentRef.current.x, currentRef.current.y, currentRef.current.zoom)
    }
  }

  const thumbX = ((look.x + 1) / 2) * 100
  const thumbY = ((look.y + 1) / 2) * 100

  // Subtle geo readout around Amsterdam while panning
  const coordLng = (4.9041 + look.x * 0.018).toFixed(3)
  const coordLat = (52.3676 - look.y * 0.012).toFixed(3)

  return (
    <div
      ref={rootRef}
      className={`hero__media${enabled ? ' hero__media--pan' : ''}${dragging ? ' is-dragging' : ''}${looking ? ' is-looking' : ''}`}
      onPointerLeave={onRootPointerLeave}
    >
      <div
        className="hero__media-stage"
        onPointerEnter={onStagePointerEnter}
        onPointerMove={onStagePointerMove}
      >
        <Image
          className="hero__media-img"
          src={src}
          alt={alt}
          fill
          priority
          sizes={sizes}
          unoptimized={unoptimized}
          onLoad={onImageLoad}
        />
      </div>

      {enabled ? (
        <>
          <div
            className={`hero__media-hint${hintVisible ? ' is-visible' : ''}`}
            aria-hidden={!hintVisible}
          >
            <span className="hero__media-hint-icon" aria-hidden />
            <span>{messages.home.hero.lookHint}</span>
          </div>

          <div
            className="hero__media-slider hero__media-slider--x"
            role="slider"
            aria-label={messages.home.hero.lookHintAxisX}
            aria-valuemin={-100}
            aria-valuemax={100}
            aria-valuenow={Math.round(look.x * 100)}
            tabIndex={0}
            onPointerDown={onSliderPointerDown('x')}
            onPointerMove={onSliderPointerMove('x')}
            onPointerUp={onSliderPointerUp}
            onPointerCancel={onSliderPointerUp}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft') setTarget(look.x - 0.08, look.y, ZOOM_ACTIVE)
              if (event.key === 'ArrowRight') setTarget(look.x + 0.08, look.y, ZOOM_ACTIVE)
            }}
          >
            <span className="hero__media-slider-track" aria-hidden />
            <span
              className="hero__media-slider-thumb"
              style={{ left: `${thumbX}%` }}
              aria-hidden
            />
            <span
              className="hero__media-slider-coord"
              style={{ left: `${thumbX}%` }}
              aria-hidden
            >
              {coordLng}° E
            </span>
          </div>

          <div
            className="hero__media-slider hero__media-slider--y"
            role="slider"
            aria-label={messages.home.hero.lookHintAxisY}
            aria-valuemin={-100}
            aria-valuemax={100}
            aria-valuenow={Math.round(look.y * 100)}
            tabIndex={0}
            onPointerDown={onSliderPointerDown('y')}
            onPointerMove={onSliderPointerMove('y')}
            onPointerUp={onSliderPointerUp}
            onPointerCancel={onSliderPointerUp}
            onKeyDown={(event) => {
              if (event.key === 'ArrowUp') setTarget(look.x, look.y - 0.08, ZOOM_ACTIVE)
              if (event.key === 'ArrowDown') setTarget(look.x, look.y + 0.08, ZOOM_ACTIVE)
            }}
          >
            <span className="hero__media-slider-track" aria-hidden />
            <span
              className="hero__media-slider-thumb"
              style={{ top: `${thumbY}%` }}
              aria-hidden
            />
            <span
              className="hero__media-slider-coord"
              style={{ top: `${thumbY}%` }}
              aria-hidden
            >
              {coordLat}° N
            </span>
          </div>
        </>
      ) : null}
    </div>
  )
}
