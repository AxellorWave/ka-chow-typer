import { formatKey, formatNumber } from '../stats/format.js'
import { compareKey, runKeyStats } from './pitstop.js'
import styles from './PitstopReport.module.css'

const VERDICTS = {
  better: { label: 'Лучше', icon: '▲' },
  worse: { label: 'Хуже', icon: '▼' },
  same: { label: 'Без изменений', icon: '=' },
  unknown: { label: 'Нет данных', icon: '·' },
}

function Change({ before, after, unit }) {
  return (
    <span className={styles.change}>
      <span className={styles.before}>
        {formatNumber(before)}
        {unit}
      </span>
      <span aria-hidden="true">→</span>
      <span className={styles.after}>
        {after === undefined ? '—' : `${formatNumber(after)}${unit}`}
      </span>
    </span>
  )
}

function ReportRow({ before, after }) {
  const verdict = compareKey(before, after)
  return (
    <li className={`${styles.row} ${styles[verdict]}`}>
      <kbd className={styles.key}>{formatKey(before.key)}</kbd>
      <span className={styles.metric}>
        <span className={styles.caption}>Ошибки</span>
        <Change before={before.error_rate} after={after?.error_rate} unit="%" />
      </span>
      <span className={styles.metric}>
        <span className={styles.caption}>Задержка</span>
        <Change before={before.avg_latency_ms} after={after?.avg_latency_ms} unit=" мс" />
      </span>
      <span className={styles.verdict}>
        <span aria-hidden="true">{VERDICTS[verdict].icon}</span> {VERDICTS[verdict].label}
      </span>
    </li>
  )
}

function Report({ focus, result }) {
  const current = runKeyStats(result.text, result.keystrokes)
  return (
    <ul className={styles.rows}>
      {focus.keys.map((item) => (
        <ReportRow key={item.key} before={item} after={current.get(item.key)} />
      ))}
    </ul>
  )
}

export default function PitstopReport({ pitstop, result }) {
  return (
    <section className={styles.report} aria-labelledby="pitstop-report-title">
      <h2 id="pitstop-report-title" className={styles.title}>
        Пит-стоп: до → после
      </h2>
      {pitstop.fallback ? (
        <p className={styles.notice}>
          Статистика по клавишам ещё копится, поэтому сравнивать пока нечего. Проедь ещё несколько
          заездов — и пит-стоп покажет, где ты стал быстрее и точнее.
        </p>
      ) : (
        <>
          <p className={styles.hint}>Слева — твоя статистика до пит-стопа, справа — этот заезд.</p>
          <Report focus={pitstop.focus} result={result} />
        </>
      )}
    </section>
  )
}
