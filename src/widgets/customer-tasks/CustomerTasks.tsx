import { useCustomerTasks } from '@/entities/customer-task'
import { he } from '@/shared/i18n/he'
import { Card, Loader, StatusBadge } from '@/shared/ui'
import type { ICustomerTasksProps } from './ICustomerTasks'
import styles from './CustomerTasks.module.css'

export function CustomerTasks({ customerId }: ICustomerTasksProps) {
  const { state, retry } = useCustomerTasks(customerId)

  return (
    <Card title={he.customerTasks.title}>
      {state.status === 'loading' && <Loader label={he.customerTasks.loading} />}
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
      {state.status === 'success' && state.data.length === 0 && (
        <p className={styles.message}>{he.customerTasks.empty}</p>
      )}
      {state.status === 'success' && state.data.length > 0 && (
        <ul className={styles.list}>
          {state.data.map((task) => (
            <li key={task.id} className={styles.item}>
              <span className={styles.text}>{task.text}</span>
              <StatusBadge tone={task.isCompleted ? 'success' : 'warning'}>
                {task.isCompleted ? he.customerTasks.status.done : he.customerTasks.status.open}
              </StatusBadge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
