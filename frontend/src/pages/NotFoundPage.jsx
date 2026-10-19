import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section>
      <h1>Съехали с трассы</h1>
      <p>Такой страницы нет.</p>
      <Link to="/">На старт</Link>
    </section>
  )
}
