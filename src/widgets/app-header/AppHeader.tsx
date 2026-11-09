import { Link } from 'react-router'
import { he } from '@/shared/i18n/he'
import styles from './AppHeader.module.css'
import { useNavItems } from './useNavItems'

export function AppHeader() {
  const items = useNavItems()

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.brandLabel}>{he.header.brand}</span>
        <span className={styles.divider} aria-hidden="true" />
        <span className={styles.brandLabel}>{he.header.product}</span>
      </div>
      <nav className={styles.nav} aria-label={he.header.navLabel}>
        {items.map((item) => (
          <Link
            key={item.key}
            to={item.to}
            className={styles.link}
            aria-current={item.isActive ? 'page' : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
