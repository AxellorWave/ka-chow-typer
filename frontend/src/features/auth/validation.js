const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NICKNAME_PATTERN = /^[A-Za-zА-Яа-яЁё0-9_-]+$/
const REQUIRED = 'Обязательное поле'

const FIELD_BY_ERROR_CODE = {
  email_taken: 'email',
  nickname_taken: 'nickname',
}

function validateEmail(email) {
  const value = email.trim()
  if (!value) return REQUIRED
  if (!EMAIL_PATTERN.test(value)) return 'Некорректный email'
  return null
}

function validateNickname(nickname) {
  const value = nickname.trim()
  if (!value) return REQUIRED
  if (value.length < 3 || value.length > 32) return 'От 3 до 32 символов'
  if (!NICKNAME_PATTERN.test(value)) return 'Только буквы, цифры, _ и -'
  return null
}

function validateNewPassword(password) {
  if (!password) return REQUIRED
  if (password.length < 8 || password.length > 128) return 'От 8 до 128 символов'
  return null
}

function collectErrors(checks) {
  return Object.fromEntries(Object.entries(checks).filter(([, message]) => message))
}

export function validateLogin({ email, password }) {
  return collectErrors({
    email: validateEmail(email),
    password: password ? null : REQUIRED,
  })
}

export function validateRegister({ email, nickname, password }) {
  return collectErrors({
    email: validateEmail(email),
    nickname: validateNickname(nickname),
    password: validateNewPassword(password),
  })
}

export function parseServerError(error) {
  const data = error.response?.data
  if (!data?.error) {
    return { fields: {}, form: 'Нет связи с сервером. Попробуйте ещё раз.' }
  }
  if (data.fields) {
    const fields = Object.fromEntries(
      Object.entries(data.fields).map(([name, messages]) => [
        name,
        Array.isArray(messages) ? messages[0] : messages,
      ]),
    )
    return { fields, form: null }
  }
  const field = FIELD_BY_ERROR_CODE[data.error]
  if (field) {
    return { fields: { [field]: data.message }, form: null }
  }
  return { fields: {}, form: data.message }
}
