import { useEffect, useRef, useState } from 'react'
import Button from '../../components/Button.jsx'
import TextField from '../../components/TextField.jsx'
import { useAuthStore } from '../../store/authStore.js'
import { parseServerError, validateNickname } from '../auth/validation.js'
import StatsSection from '../stats/StatsSection.jsx'
import { AVATAR_TYPES, cropAvatar } from './cropAvatar.js'
import { useRemoveAvatar, useUpdateNickname, useUploadAvatar } from './useProfile.js'
import styles from './PilotSection.module.css'

const AVATAR_ERRORS = {
  413: 'Фото больше 512 КБ, выберите поменьше',
  415: 'Подойдёт фото в формате PNG, JPEG или WebP',
}

function nicknameServerError(error) {
  if (error.response?.status === 409) return 'Ник уже занят'
  const { fields, form } = parseServerError(error)
  return fields.nickname ?? form
}

function avatarServerError(error) {
  return AVATAR_ERRORS[error.response?.status] ?? parseServerError(error).form
}

export default function PilotSection() {
  const user = useAuthStore((state) => state.user)
  const fileInput = useRef(null)
  const [nickname, setNickname] = useState(user.nickname)
  const [nicknameError, setNicknameError] = useState(null)
  const [preview, setPreview] = useState(null)
  const [avatarError, setAvatarError] = useState(null)
  const updateNickname = useUpdateNickname()
  const uploadAvatar = useUploadAvatar()
  const removeAvatar = useRemoveAvatar()

  useEffect(() => () => preview && URL.revokeObjectURL(preview.url), [preview])

  const trimmed = nickname.trim()
  const fieldError =
    nicknameError ?? (trimmed === user.nickname ? null : validateNickname(nickname))
  const avatarBusy = uploadAvatar.isPending || removeAvatar.isPending
  const avatarUrl = preview?.url ?? user.avatar_url

  function handleNicknameChange(event) {
    setNickname(event.target.value)
    setNicknameError(null)
  }

  function handleNicknameSubmit(event) {
    event.preventDefault()
    if (fieldError || trimmed === user.nickname) return
    updateNickname.mutate(
      { nickname: trimmed },
      {
        onSuccess: (saved) => setNickname(saved.nickname),
        onError: (error) => setNicknameError(nicknameServerError(error)),
      },
    )
  }

  async function handleFileChange(event) {
    const [file] = event.target.files
    event.target.value = ''
    if (!file) return
    setAvatarError(null)
    try {
      const blob = await cropAvatar(file)
      setPreview({ blob, url: URL.createObjectURL(blob) })
    } catch (error) {
      setAvatarError(error.message)
    }
  }

  function handleAvatarSave() {
    uploadAvatar.mutate(preview.blob, {
      onSuccess: () => setPreview(null),
      onError: (error) => setAvatarError(avatarServerError(error)),
    })
  }

  function handleAvatarCancel() {
    setPreview(null)
    setAvatarError(null)
  }

  function handleAvatarRemove() {
    setAvatarError(null)
    removeAvatar.mutate(undefined, {
      onError: (error) => setAvatarError(avatarServerError(error)),
    })
  }

  return (
    <StatsSection title="Пилот">
      <div className={styles.body}>
        <div className={styles.avatarBlock}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={preview ? 'Предпросмотр фото' : 'Фото пилота'}
              className={preview ? `${styles.avatar} ${styles.avatarPreview}` : styles.avatar}
            />
          ) : (
            <span className={styles.avatar} aria-hidden="true">
              {user.nickname.charAt(0).toUpperCase()}
            </span>
          )}
          <input
            ref={fileInput}
            type="file"
            accept={AVATAR_TYPES.join(',')}
            className={styles.fileInput}
            onChange={handleFileChange}
            tabIndex={-1}
            aria-hidden="true"
          />
          <div className={styles.avatarActions}>
            {preview ? (
              <>
                <Button
                  type="button"
                  variant="accent"
                  loading={uploadAvatar.isPending}
                  onClick={handleAvatarSave}
                >
                  Сохранить фото
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={uploadAvatar.isPending}
                  onClick={handleAvatarCancel}
                >
                  Отмена
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="accent"
                  disabled={avatarBusy}
                  onClick={() => fileInput.current.click()}
                >
                  Загрузить фото
                </Button>
                {user.avatar_url && (
                  <Button
                    type="button"
                    variant="ghost"
                    loading={removeAvatar.isPending}
                    disabled={avatarBusy}
                    onClick={handleAvatarRemove}
                  >
                    Убрать фото
                  </Button>
                )}
              </>
            )}
          </div>
          {preview && !avatarError && (
            <p className={styles.hint}>Так фото будет выглядеть в профиле и в таблицах</p>
          )}
          {avatarError && (
            <p className={styles.error} role="alert">
              {avatarError}
            </p>
          )}
        </div>

        <form className={styles.nicknameForm} onSubmit={handleNicknameSubmit} noValidate>
          <TextField
            label="Ник"
            name="nickname"
            autoComplete="nickname"
            maxLength={32}
            value={nickname}
            error={fieldError}
            onChange={handleNicknameChange}
          />
          <p className={styles.hint}>От 3 до 32 символов: буквы, цифры, _ и -</p>
          <Button
            type="submit"
            loading={updateNickname.isPending}
            disabled={Boolean(fieldError) || trimmed === user.nickname}
            className={styles.submit}
          >
            Сохранить ник
          </Button>
        </form>
      </div>
    </StatsSection>
  )
}
