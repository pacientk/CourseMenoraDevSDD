import { he } from '@/shared/i18n/he'
import { CustomerTasks } from '@/widgets/customer-tasks'
import { ProfileCard } from '@/widgets/profile-card'
import styles from './CustomerPage.module.css'
import { useCustomerId } from './useCustomerId'

export function CustomerPage() {
  const customerId = useCustomerId()

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>{he.customerPage.title}</h1>
      <p className={styles.subtitle}>{he.customerPage.subtitle}</p>
      <div className={styles.content}>
        {customerId === null ? (
          <p className={styles.notFound}>{he.states.notFound}</p>
        ) : (
          <>
            <ProfileCard customerId={customerId} />
            <CustomerTasks customerId={customerId} />
          </>
        )}
      </div>
    </section>
  )
}
