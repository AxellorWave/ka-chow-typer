import { createBrowserRouter } from 'react-router-dom'
import Layout from './Layout.jsx'
import GuestRoute from './GuestRoute.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import PageLoader from '../components/PageLoader.jsx'
import RouteError from '../components/RouteError.jsx'

const page = (load) => async () => ({ Component: (await load()).default })

const router = createBrowserRouter([
  {
    element: <Layout />,
    hydrateFallbackElement: <PageLoader />,
    errorElement: <RouteError fullPage />,
    children: [
      {
        errorElement: <RouteError />,
        children: [
          { index: true, lazy: page(() => import('../pages/HomePage.jsx')) },
          { path: 'train', lazy: page(() => import('../pages/TrainPage.jsx')) },
          { path: 'career', lazy: page(() => import('../pages/CareerPage.jsx')) },
          { path: 'daily', lazy: page(() => import('../pages/DailyPage.jsx')) },
          { path: 'leaderboard', lazy: page(() => import('../pages/LeaderboardPage.jsx')) },
          { path: 'achievements', lazy: page(() => import('../pages/AchievementsPage.jsx')) },
          {
            element: <GuestRoute />,
            children: [
              { path: 'login', lazy: page(() => import('../pages/LoginPage.jsx')) },
              { path: 'register', lazy: page(() => import('../pages/RegisterPage.jsx')) },
            ],
          },
          { path: 'oauth/callback', lazy: page(() => import('../pages/OAuthCallbackPage.jsx')) },
          {
            element: <ProtectedRoute />,
            children: [
              { path: 'profile', lazy: page(() => import('../pages/ProfilePage.jsx')) },
              { path: 'garage', lazy: page(() => import('../pages/GaragePage.jsx')) },
            ],
          },
          { path: '*', lazy: page(() => import('../pages/NotFoundPage.jsx')) },
        ],
      },
    ],
  },
])

export default router
