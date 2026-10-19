import confetti from 'canvas-confetti'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import Button from '../../components/Button.jsx'
import { DIFFICULTIES, MODES } from '../train/options.js'
import styles from './LevelUpModal.module.css'

const MotionDiv = motion.div

const CONFETTI_TOKENS = ['--color-primary', '--color-accent', '--flame-outer', '--car-blue']

function confettiColors() {
  const style = getComputedStyle(document.documentElement)
  return CONFETTI_TOKENS.map((token) => style.getPropertyValue(token).trim()).filter(Boolean)
}

function unlocksBetween(from, to) {
  const opened = (item) => item.unlockLevel > from && item.unlockLevel <= to
  return [
    ...MODES.filter(opened).map((mode) => `Режим «${mode.label}»`),
    ...DIFFICULTIES.filter(opened).map((difficulty) => `Сложность «${difficulty.label}»`),
  ]
}

export default function LevelUpModal({ level, levelsGained = 1, open, onClose }) {
  const reduced = useReducedMotion()
  const closeRef = useRef(null)
  const unlocks = unlocksBetween(level - levelsGained, level)

  useEffect(() => {
    if (!open) return undefined
    closeRef.current?.focus()
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.6 },
      colors: confettiColors(),
      disableForReducedMotion: true,
    })
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'Enter') {
        event.preventDefault()
        event.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <MotionDiv
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <MotionDiv
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="level-up-title"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.7, y: 40 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            onClick={(event) => event.stopPropagation()}
          >
            <span className={styles.badge} aria-hidden="true">
              {level}
            </span>
            <h2 id="level-up-title" className={styles.title}>
              Новый уровень!
            </h2>
            <p className={styles.text}>Ka-chow! Теперь ты на {level} уровне.</p>
            {unlocks.length > 0 && (
              <div className={styles.unlocks}>
                <p className={styles.unlocksTitle}>Открылось</p>
                <ul className={styles.list}>
                  {unlocks.map((unlock) => (
                    <li key={unlock}>🔓 {unlock}</li>
                  ))}
                </ul>
              </div>
            )}
            <Button ref={closeRef} variant="accent" onClick={onClose}>
              Погнали!
            </Button>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  )
}
