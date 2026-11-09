import { Link } from 'react-router'
import { customerPath, DEFAULT_CUSTOMER_ID } from '@/shared/config/routes'
import { he } from '@/shared/i18n/he'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  return (
    <section className={styles.page}>
      <h1 className={styles.title}>{he.notFound.title}</h1>
      <Link to={customerPath(DEFAULT_CUSTOMER_ID)} className={styles.link}>
        {he.notFound.backLink}
      </Link>
    </section>
  )
}
