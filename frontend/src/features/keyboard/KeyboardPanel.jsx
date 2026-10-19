import { useSettingsStore } from '../../store/settingsStore.js'
import HandsHint from './HandsHint.jsx'
import LayoutWarning from './LayoutWarning.jsx'
import VirtualKeyboard from './VirtualKeyboard.jsx'
import { LAYOUT_TITLES, layoutForLang } from './layouts.js'
import styles from './KeyboardPanel.module.css'

export default function KeyboardPanel({ engine, lang = 'ru' }) {
  const showKeyboard = useSettingsStore((state) => state.showKeyboard)
  const showHands = useSettingsStore((state) => state.showHands)
  const toggleKeyboard = useSettingsStore((state) => state.toggleKeyboard)
  const toggleHands = useSettingsStore((state) => state.toggleHands)
  const layout = layoutForLang(lang)

  return (
    <section className={styles.panel} aria-label="Подсказки по клавиатуре">
      <LayoutWarning engine={engine} />
      <div className={styles.toolbar}>
        <span className={styles.layout}>{LAYOUT_TITLES[layout]}</span>
        <button
          type="button"
          className={styles.toggle}
          aria-pressed={showKeyboard}
          onClick={toggleKeyboard}
        >
          {showKeyboard ? 'Скрыть клавиатуру' : 'Показать клавиатуру'}
        </button>
        <button
          type="button"
          className={styles.toggle}
          aria-pressed={showHands}
          onClick={toggleHands}
        >
          {showHands ? 'Скрыть руки' : 'Показать руки'}
        </button>
      </div>
      {showKeyboard && <VirtualKeyboard engine={engine} layout={layout} />}
      {showHands && <HandsHint engine={engine} layout={layout} />}
    </section>
  )
}
