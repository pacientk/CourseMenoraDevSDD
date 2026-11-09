import { useAsyncResource } from '@/shared/api'
import type { ILoadResult } from '@/shared/api'
import { fetchCustomerTasks } from '../api/fetchCustomerTasks'
import { mapCustomerTasks } from './mapCustomerTasks'
import type { CustomerTask } from './types'

export function useCustomerTasks(customerId: number): ILoadResult<CustomerTask[]> {
  return useAsyncResource(customerId, async (signal) =>
    mapCustomerTasks(await fetchCustomerTasks(customerId, signal)),
  )
}
