import { useAsyncResource } from '@/shared/api'
import type { ILoadResult } from '@/shared/api'
import { fetchCustomer } from '../api/fetchCustomer'
import { mapCustomer } from './mapCustomer'
import type { Customer } from './types'

export function useCustomer(customerId: number): ILoadResult<Customer> {
  return useAsyncResource(customerId, async (signal) =>
    mapCustomer(await fetchCustomer(customerId, signal)),
  )
}
