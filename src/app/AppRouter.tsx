import { Navigate, Route, Routes } from 'react-router'
import { ComingSoonPage } from '@/pages/coming-soon'
import { CustomerPage } from '@/pages/customer'
import { NotFoundPage } from '@/pages/not-found'
import { customerPath, DEFAULT_CUSTOMER_ID, ROUTES } from '@/shared/config/routes'
import { he } from '@/shared/i18n/he'
import { AppLayout } from './AppLayout'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          path={ROUTES.root}
          element={<Navigate to={customerPath(DEFAULT_CUSTOMER_ID)} replace />}
        />
        <Route path={ROUTES.customer} element={<CustomerPage />} />
        <Route path={ROUTES.claims} element={<ComingSoonPage title={he.header.nav.claims} />} />
        <Route path={ROUTES.history} element={<ComingSoonPage title={he.header.nav.history} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
