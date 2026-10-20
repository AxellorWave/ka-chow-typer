import { useNavigate } from 'react-router-dom'
import DailyHomeCard from '../features/daily/DailyHomeCard.jsx'
import HomeCards from '../features/home/HomeCards.jsx'
import HomeHero from '../features/home/HomeHero.jsx'
import styles from './HomePage.module.css'

export default function HomePage() {
  const navigate = useNavigate()
  return (
    <div className={styles.page}>
      <HomeHero onStart={() => navigate('/train')} />
      <HomeCards />
      <DailyHomeCard />
    </div>
  )
}
