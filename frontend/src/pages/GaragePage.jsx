import { useState } from 'react'
import Button from '../components/Button.jsx'
import QueryError from '../components/QueryError.jsx'
import SegmentedControl from '../components/SegmentedControl.jsx'
import Skeleton from '../components/Skeleton.jsx'
import { playSound } from '../features/audio/sounds.js'
import { useToastStore } from '../features/effects/toastStore.js'
import CarPreview from '../features/garage/CarPreview.jsx'
import GarageItemCard from '../features/garage/GarageItemCard.jsx'
import { useGarage, useSaveGarage } from '../features/garage/useGarage.js'
import styles from './GaragePage.module.css'

const SLOT_LABELS = {
  hero: 'Машина',
  color: 'Цвет',
  wheels: 'Диски',
}

const SLOTS = Object.keys(SLOT_LABELS)

const saveErrorMessage = (error) =>
  error.response?.data?.message ?? 'Не удалось сохранить машинку. Попробуйте ещё раз.'

export default function GaragePage() {
  const { data, isPending, isError, refetch } = useGarage()
  const save = useSaveGarage()
  const pushToast = useToastStore((state) => state.push)
  const [slot, setSlot] = useState('hero')
  const [changes, setChanges] = useState({})

  const saved = data?.config ?? {}
  const draft = { ...saved, ...changes }
  const patch = Object.fromEntries(
    Object.entries(changes).filter(([key, code]) => saved[key] !== code),
  )
  const dirty = Object.keys(patch).length > 0
  const items = data?.slots.find((group) => group.slot === slot)?.items ?? []

  const select = (code) => {
    save.reset()
    if (draft[slot] !== code) playSound('sfx-garage-wrench')
    setChanges((previous) => ({ ...previous, [slot]: code }))
  }

  const reset = () => {
    save.reset()
    setChanges({})
  }

  const submit = () =>
    save.mutate(patch, {
      onSuccess: () => {
        setChanges({})
        pushToast({
          icon: '🔧',
          caption: 'Гараж',
          title: 'Машинка готова',
          text: 'Новый тюнинг уже на трассе.',
        })
      },
    })

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <h1 className={styles.title}>Гараж</h1>
        <p className={styles.subtitle}>
          Выбери героя, перекрась кузов и поставь новые диски. Новые машины и детали открываются с
          уровнем и ачивками.
        </p>
      </header>

      {isPending && (
        <div className={styles.layout}>
          <Skeleton height="260px" />
          <Skeleton height="360px" />
        </div>
      )}

      {isError && <QueryError onRetry={refetch} title="Не удалось открыть гараж" />}

      {data && (
        <div className={styles.layout}>
          <section className={styles.preview} aria-label="Превью">
            <CarPreview config={draft} />
            <div className={styles.actions}>
              <Button type="button" onClick={submit} disabled={!dirty} loading={save.isPending}>
                Сохранить
              </Button>
              <button
                type="button"
                className={styles.reset}
                onClick={reset}
                disabled={!dirty || save.isPending}
              >
                Сбросить
              </button>
            </div>
            {save.isError && (
              <p className={styles.error} role="alert">
                {saveErrorMessage(save.error)}
              </p>
            )}
          </section>

          <section className={styles.parts} aria-label="Детали">
            <div className={styles.tabs}>
              <SegmentedControl
                label="Слот"
                options={data.slots
                  .filter((group) => SLOTS.includes(group.slot))
                  .map((group) => ({ value: group.slot, label: SLOT_LABELS[group.slot] }))}
                value={slot}
                onChange={setSlot}
              />
            </div>
            <div className={styles.grid}>
              {items.map((item) => (
                <GarageItemCard
                  key={item.code}
                  item={item}
                  preview={{ ...draft, [slot]: item.code }}
                  selected={draft[slot] === item.code}
                  saved={saved[slot] === item.code}
                  onSelect={select}
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
