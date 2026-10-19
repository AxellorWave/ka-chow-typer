import { oauthStartUrl } from '../../api/auth.js'
import styles from './OAuthButtons.module.css'

const PROVIDERS = [
  { id: 'vk', label: 'Войти через VK ID', mark: 'VK', className: styles.vk },
  { id: 'yandex', label: 'Войти через Яндекс ID', mark: 'Я', className: styles.yandex },
]

export default function OAuthButtons() {
  return (
    <div className={styles.oauth}>
      <p className={styles.divider}>или</p>
      {PROVIDERS.map((provider) => (
        <a
          key={provider.id}
          href={oauthStartUrl(provider.id)}
          className={`${styles.button} ${provider.className}`}
        >
          <span className={styles.mark} aria-hidden="true">
            {provider.mark}
          </span>
          {provider.label}
        </a>
      ))}
    </div>
  )
}
