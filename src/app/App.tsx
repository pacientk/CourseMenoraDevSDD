import { BrowserRouter } from 'react-router'
import { AppRouter } from './AppRouter'

export function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
}
