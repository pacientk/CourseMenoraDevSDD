import type { IStatusBadgeProps } from './IStatusBadge'
import styles from './StatusBadge.module.css'

export function StatusBadge({ tone, children }: IStatusBadgeProps) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>
}
