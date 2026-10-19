import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useToastStore } from './toastStore.js'
import styles from './ToastHost.module.css'

const MotionItem = motion.li

export default function ToastHost() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)
  const reduced = useReducedMotion()
  const offset = reduced ? 0 : 48

  return (
    <ol className={styles.host} aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <MotionItem
            key={toast.id}
            layout={!reduced}
            className={styles.toast}
            initial={{ opacity: 0, x: offset }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: offset }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          >
            <span className={styles.icon} aria-hidden="true">
              {toast.icon}
            </span>
            <span className={styles.body}>
              <span className={styles.caption}>Новое достижение</span>
              <strong className={styles.title}>{toast.title}</strong>
              {toast.text && <span className={styles.text}>{toast.text}</span>}
            </span>
            <button
              type="button"
              className={styles.close}
              aria-label="Закрыть"
              onClick={() => dismiss(toast.id)}
            >
              ×
            </button>
          </MotionItem>
        ))}
      </AnimatePresence>
    </ol>
  )
}
