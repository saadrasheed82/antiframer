'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

const EASING = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))

export default function LenisSmoothScroll() {
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>
    if (w.__lenisActive) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: EASING,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    })
    w.__lenisActive = true

    let rafId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    // Route in-page anchor links through Lenis so they glide instead of
    // fighting the smooth-scroll engine.
    const onAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
      if (!anchor) return
      const href = anchor.getAttribute('href') ?? ''
      if (href === '#' || href.length < 2) return
      const target = document.querySelector(href)
      if (!target) return
      e.preventDefault()
      lenis.scrollTo(target, { duration: 1.1, easing: EASING })
    }
    document.addEventListener('click', onAnchorClick, true)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      document.removeEventListener('click', onAnchorClick, true)
      w.__lenisActive = false
    }
  }, [])

  return null
}
