import { he } from '@/shared/i18n/he'

// Заглушка стартового репозитория. Каркас приложения (шапка, навигация, маршруты)
// появится при исполнении SPEC-001 — см. docs/specs/SPEC-001-app-shell/spec.md.
export function App() {
  return (
    <main>
      <h1>{he.app.title}</h1>
      <p>{he.app.starterHint}</p>
    </main>
  )
}
