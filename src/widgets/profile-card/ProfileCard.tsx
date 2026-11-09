import { he } from '@/shared/i18n/he'
import { Avatar, Card, Loader } from '@/shared/ui'
import type { IProfileCardProps } from './IProfileCard'
import styles from './ProfileCard.module.css'
import { useProfileCardView } from './useProfileCardView'

export function ProfileCard({ customerId }: IProfileCardProps) {
  const { state, retry, view } = useProfileCardView(customerId)

  return (
    <Card title={he.profileCard.title}>
      {state.status === 'loading' && <Loader label={he.profileCard.loading} />}
      {state.status === 'not-found' && <p className={styles.message}>{he.states.notFound}</p>}
      {state.status === 'error' && (
        <div className={styles.error}>
          <p className={styles.message} role="alert">
            {he.states.error}
          </p>
          <button type="button" className={styles.retry} onClick={retry}>
            {he.states.retry}
          </button>
        </div>
      )}
      {view && (
        <div className={styles.profile}>
          <div className={styles.identity}>
            <Avatar src={view.customer.avatarUrl} initials={view.initials} />
            <p className={styles.name}>{view.fullName}</p>
          </div>
          <dl className={styles.fields}>
            <div className={styles.field}>
              <dt className={styles.label}>{he.profileCard.fields.id}</dt>
              <dd className={styles.value}>{view.customer.id}</dd>
            </div>
            <div className={styles.field}>
              <dt className={styles.label}>{he.profileCard.fields.phone}</dt>
              <dd className={styles.value} dir="ltr">
                {view.customer.phone}
              </dd>
            </div>
            <div className={styles.field}>
              <dt className={styles.label}>{he.profileCard.fields.email}</dt>
              <dd className={styles.value} dir="ltr">
                {view.customer.email}
              </dd>
            </div>
            <div className={styles.field}>
              <dt className={styles.label}>{he.profileCard.fields.city}</dt>
              <dd className={styles.value}>{view.customer.city}</dd>
            </div>
          </dl>
        </div>
      )}
    </Card>
  )
}
