import { matchPath, useLocation } from 'react-router'
import { customerPath, DEFAULT_CUSTOMER_ID, ROUTES } from '@/shared/config/routes'
import { he } from '@/shared/i18n/he'

export interface INavItem {
  key: string
  to: string
  label: string
  isActive: boolean
}

export function useNavItems(): INavItem[] {
  const { pathname } = useLocation()
  const isOn = (pattern: string): boolean =>
    matchPath({ path: pattern, end: false }, pathname) !== null

  return [
    {
      key: 'customers',
      to: customerPath(DEFAULT_CUSTOMER_ID),
      label: he.header.nav.customers,
      isActive: isOn('/customers/*'),
    },
    { key: 'claims', to: ROUTES.claims, label: he.header.nav.claims, isActive: isOn(ROUTES.claims) },
    { key: 'history', to: ROUTES.history, label: he.header.nav.history, isActive: isOn(ROUTES.history) },
  ]
}
