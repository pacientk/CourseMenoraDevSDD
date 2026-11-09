import { getJson, isResourceId } from '@/shared/api'

export function fetchCustomerTasks(customerId: number, signal: AbortSignal): Promise<unknown> {
  if (!isResourceId(customerId)) {
    throw new RangeError('Invalid customer id')
  }
  return getJson(`/users/${customerId}/todos`, { signal })
}
