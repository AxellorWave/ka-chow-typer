import { RouterProvider } from 'react-router-dom'
import Providers from './Providers.jsx'
import router from './router.jsx'
import { useSessionBootstrap } from '../features/auth/useSessionBootstrap.js'

export default function App() {
  useSessionBootstrap()

  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  )
}
