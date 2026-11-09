import { he } from '@/shared/i18n/he'
import styles from './ComingSoonPage.module.css'
import type { IComingSoonPageProps } from './IComingSoonPage'

export function ComingSoonPage({ title }: IComingSoonPageProps) {
  return (
    <section className={styles.page}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.text}>{he.comingSoon.text}</p>
    </section>
  )
}
