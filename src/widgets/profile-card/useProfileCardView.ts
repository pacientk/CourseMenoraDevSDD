import { useMemo } from 'react'
import { useCustomer } from '@/entities/customer'
import type { Customer } from '@/entities/customer'
import type { LoadState } from '@/shared/api'

export interface IProfileCardView {
  fullName: string
  initials: string
  customer: Customer
}

function firstLetter(value: string): string {
  return Array.from(value)[0] ?? ''
}

function buildView(customer: Customer): IProfileCardView {
  return {
    fullName: `${customer.firstName} ${customer.lastName}`,
    initials: `${firstLetter(customer.firstName)}${firstLetter(customer.lastName)}`,
    customer,
  }
}

export function useProfileCardView(customerId: number): {
  state: LoadState<Customer>
  retry: () => void
  view: IProfileCardView | null
} {
  const { state, retry } = useCustomer(customerId)
  const view = useMemo(
    () => (state.status === 'success' ? buildView(state.data) : null),
    [state],
  )
  return { state, retry, view }
}
