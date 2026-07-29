'use client'

import { useEffect, useRef } from 'react'

type Point = {
  x: number
  y: number
  originX: number
  originY: number
  vx: number
  vy: number
  closest: Point[]
}

const SPACING = 90
const DRIFT_RANGE = 40
const NEIGHBOR_COUNT = 5
const MOUSE_RADIUS = 260

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

// A drifting "constellation" of points connected to their nearest neighbors,
// brightening near the cursor — same effect as technoscope.com.tr's hero
// background, reimplemented with plain canvas instead of their GSAP setup.
export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let points: Point[] = []
    let frameId = 0
    const mouse = { x: -9999, y: -9999 }

    function setup() {
      width = window.innerWidth
      height = window.innerHeight
      canvas!.width = width
      canvas!.height = height

      const raw: Point[] = []
      for (let x = 0; x < width + SPACING; x += SPACING) {
        for (let y = 0; y < height + SPACING; y += SPACING) {
          const px = x + Math.random() * SPACING
          const py = y + Math.random() * SPACING
          raw.push({
            x: px,
            y: py,
            originX: px,
            originY: py,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            closest: [],
          })
        }
      }

      for (const p1 of raw) {
        p1.closest = raw
          .filter((p2) => p2 !== p1)
          .sort((a, b) => distance(p1, a) - distance(p1, b))
          .slice(0, NEIGHBOR_COUNT)
      }

      points = raw
    }

    function drawFrame() {
      ctx!.clearRect(0, 0, width, height)

      for (const p of points) {
        p.x += p.vx
        p.y += p.vy
        if (Math.abs(p.x - p.originX) > DRIFT_RANGE) p.vx *= -1
        if (Math.abs(p.y - p.originY) > DRIFT_RANGE) p.vy *= -1
      }

      for (const p1 of points) {
        const mouseFactor = Math.max(0, 1 - distance(p1, mouse) / MOUSE_RADIUS)

        for (const p2 of p1.closest) {
          ctx!.strokeStyle = `rgba(255,255,255,${0.04 + mouseFactor * 0.35})`
          ctx!.lineWidth = 1
          ctx!.beginPath()
          ctx!.moveTo(p1.x, p1.y)
          ctx!.lineTo(p2.x, p2.y)
          ctx!.stroke()
        }

        ctx!.fillStyle = `rgba(255,255,255,${0.25 + mouseFactor * 0.6})`
        ctx!.beginPath()
        ctx!.arc(p1.x, p1.y, 1.6, 0, Math.PI * 2)
        ctx!.fill()
      }
    }

    function animate() {
      drawFrame()
      frameId = requestAnimationFrame(animate)
    }

    function handleMouseMove(e: MouseEvent) {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    function handleResize() {
      setup()
    }

    setup()
    if (prefersReducedMotion) {
      drawFrame()
    } else {
      frameId = requestAnimationFrame(animate)
      window.addEventListener('mousemove', handleMouseMove)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
}
