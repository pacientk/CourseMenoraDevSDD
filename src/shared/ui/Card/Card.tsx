import type { ICardProps } from './ICard'
import styles from './Card.module.css'

export function Card({ title, children }: ICardProps) {
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.body}>{children}</div>
    </section>
  )
}
