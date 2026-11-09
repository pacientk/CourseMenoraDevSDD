import { he } from '@/shared/i18n/he'
import styles from './CustomerPage.module.css'

export function CustomerPage() {
  return (
    <section className={styles.page}>
      <h1 className={styles.title}>{he.customerPage.title}</h1>
      <p className={styles.subtitle}>{he.customerPage.subtitle}</p>
      <div className={styles.content} />
    </section>
  )
}
