import { useQuery } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import { getOAuthProviders, oauthStartUrl } from '../../api/auth.js'
import { saveOAuthReturn } from './oauthReturn.js'
import styles from './OAuthButtons.module.css'

const PROVIDERS = [
  { id: 'vk', label: 'Войти через VK ID', mark: 'VK', className: styles.vk },
  { id: 'yandex', label: 'Войти с Яндекс ID', mark: 'Я', className: styles.yandex },
]

export default function OAuthButtons() {
  const from = useLocation().state?.from
  const { data: configured = [] } = useQuery({
    queryKey: ['oauth-providers'],
    queryFn: getOAuthProviders,
    staleTime: Infinity,
  })
  const providers = PROVIDERS.filter((provider) => configured.includes(provider.id))

  if (providers.length === 0) {
    return null
  }

  return (
    <div className={styles.oauth}>
      {providers.map((provider) => (
        <a
          key={provider.id}
          href={oauthStartUrl(provider.id)}
          className={`${styles.button} ${provider.className}`}
          onClick={() => saveOAuthReturn(from)}
        >
          <span className={styles.mark} aria-hidden="true">
            {provider.mark}
          </span>
          {provider.label}
        </a>
      ))}
      <p className={styles.divider}>или почтой</p>
    </div>
  )
}
