export const DEFAULT_CUSTOMER_ID = 1

export const ROUTES = {
  root: '/',
  customer: '/customers/:customerId',
  claims: '/claims',
  history: '/history',
} as const

export function customerPath(customerId: number): string {
  return `/customers/${customerId}`
}
