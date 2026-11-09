import type { ILoaderProps } from './ILoader'
import styles from './Loader.module.css'

export function Loader({ label }: ILoaderProps) {
  return (
    <div className={styles.loader} role="status" aria-busy="true" aria-label={label}>
      {label}
    </div>
  )
}
