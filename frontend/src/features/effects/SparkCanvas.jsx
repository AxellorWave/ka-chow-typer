import { useEffect, useRef } from 'react'
import { comboMultiplier } from '../game/scoring.js'
import { prefersReducedMotion } from './motion.js'
import styles from './SparkCanvas.module.css'

const MAX_PARTICLES = 160
const SPARKS_PER_TIER = { 1: 0, 2: 2, 3: 4, 5: 7 }
const GRAVITY = 0.12
const COLOR_TOKENS = ['--flame-core', '--flame-outer', '--color-accent']

function readColors(node) {
  const style = getComputedStyle(node)
  return COLOR_TOKENS.map((token) => style.getPropertyValue(token).trim()).filter(Boolean)
}

export default function SparkCanvas({ tracker, anchorSelector }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const host = canvas.parentElement
    const colors = readColors(host)
    const particles = []
    let frame = 0
    let pending = 0
    let ratio = 1

    const resize = () => {
      ratio = window.devicePixelRatio || 1
      canvas.width = host.clientWidth * ratio
      canvas.height = host.clientHeight * ratio
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(host)

    const spawn = () => {
      const anchor = host.querySelector(anchorSelector)
      const count = pending
      pending = 0
      if (!anchor) return
      const hostRect = host.getBoundingClientRect()
      const rect = anchor.getBoundingClientRect()
      const x = rect.left - hostRect.left + rect.width * 0.12
      const y = rect.top - hostRect.top + rect.height * 0.7
      for (let index = 0; index < count && particles.length < MAX_PARTICLES; index += 1) {
        const maxLife = 22 + Math.random() * 18
        particles.push({
          x,
          y,
          vx: -(1.5 + Math.random() * 3.5),
          vy: -(0.5 + Math.random() * 2.5),
          size: 2 + Math.random() * 2.5,
          life: maxLife,
          maxLife,
          color: colors[Math.floor(Math.random() * colors.length)],
        })
      }
    }

    const draw = () => {
      if (pending > 0) spawn()
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.clearRect(0, 0, canvas.width, canvas.height)
      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index]
        particle.life -= 1
        if (particle.life <= 0) {
          particles.splice(index, 1)
          continue
        }
        particle.vy += GRAVITY
        particle.x += particle.vx
        particle.y += particle.vy
        context.globalAlpha = particle.life / particle.maxLife
        context.fillStyle = particle.color
        context.fillRect(particle.x, particle.y, particle.size, particle.size)
      }
      context.globalAlpha = 1
      frame = particles.length > 0 ? requestAnimationFrame(draw) : 0
    }

    const emit = (count) => {
      if (count === 0) return
      pending += count
      if (!frame) frame = requestAnimationFrame(draw)
    }

    const unsubscribe = tracker.store.subscribe((state, previous) => {
      if (state.combo <= previous.combo || prefersReducedMotion()) return
      emit(SPARKS_PER_TIER[comboMultiplier(state.combo)] ?? 0)
    })

    return () => {
      unsubscribe()
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [tracker, anchorSelector])

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
}
