import { RouterProvider } from 'react-router-dom'
import Providers from './Providers.jsx'
import router from './router.jsx'
import { useSessionBootstrap } from '../features/auth/useSessionBootstrap.js'
import { useThemeEffect } from '../features/theme/useThemeEffect.js'

export default function App() {
  useSessionBootstrap()
  useThemeEffect()

  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  )
}
