import { he } from '@/shared/i18n/he'

// Starter placeholder. The application shell (header, navigation, routes)
// arrives with SPEC-001 — see docs/specs/SPEC-001-app-shell/spec.md.
export function App() {
  return (
    <main>
      <h1>{he.app.title}</h1>
      <p>{he.app.starterHint}</p>
    </main>
  )
}
