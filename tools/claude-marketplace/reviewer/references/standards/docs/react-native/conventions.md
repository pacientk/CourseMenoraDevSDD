# React Native Conventions

**Layer:** react-native — builds on `docs/core/`, `docs/architecture/fsd.md`, and
`docs/react/`. Only what is specific to React Native lives here.

---

## Source tree

The FSD layer list for this stack is
`app → navigation → screens → widgets → features → entities → shared`
(profile key `layers`).

```
src/
├── app/            # Bootstrap: root component, providers, store creation
├── navigation/     # Navigators, route constants, linking config, navigation ref
├── screens/        # One slice per screen: screens/task-list/ui/TaskListScreen/
├── widgets/        # Screen-level composite blocks reused across screens
├── features/       # User-facing capabilities
├── entities/       # Domain models and their display components
└── shared/
    ├── api/        # HTTP client, interceptors, typed request functions
    ├── config/     # Runtime configuration and startup validation
    ├── i18n/       # The i18n service and the translation hook — profile paths.i18nService
    ├── lib/        # Utilities, constants, pure helpers
    ├── services/   # Long-lived services: logging, analytics, storage, linking
    ├── store/      # Store setup and typed hooks
    └── ui/
        ├── atoms/      # Primitives — the only place that touches raw RN components
        ├── molecules/  # Small compositions of atoms
        └── tokens/     # Design tokens and the theme provider
```

Paths the configs need — atoms, tokens, the i18n service, the linking service — are
profile keys under `paths`, so a project with a different tree changes the profile,
not the rules.

---

## Primitives (atoms)

The primitive set, each named `ui.componentPrefix` + RN name:

| Primitive | Wraps | Applies once |
|---|---|---|
| `<Prefix>View` | `View` | Theme background defaults |
| `<Prefix>Text` | `Text` | Typography variants, font-scale cap, default colour |
| `<Prefix>Pressable` | `Pressable` | Touch-target floor, required a11y props, pressed state |
| `<Prefix>Image` | `Image` (or the project's image library) | Placeholder, `accessibilityIgnoresInvertColors` |
| `<Prefix>TextInput` | `TextInput` | Font-scale cap, theme colours, a11y label |
| `<Prefix>ScrollView` | `ScrollView` | Keyboard handling defaults |
| `<Prefix>List` | the list implementation in the profile | Recycling, key extraction contract |

- Atoms read design values through the theme hook. No literals.
- Atoms require the theme provider; tests wrap them in a test provider.
- Add a primitive when a raw component is needed outside atoms — never reach for the
  raw component instead.

---

## Styles modules

Each component's styles live in `<Component>.styles.ts`, next to the `.tsx`. Two
shapes:

```ts
// TaskCard.styles.ts — token-derived: a factory
import { StyleSheet } from 'react-native';
import type { Theme } from '@shared/ui/tokens';

export const makeTaskCardStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginTop: theme.spacing.md,
      backgroundColor: theme.colors.surface.primary,
    },
  });

// purely static (no theme involvement): a plain sheet in the same file
export const taskCardStaticStyles = StyleSheet.create({
  row: { flexDirection: 'row' },
});
```

```tsx
// TaskCard.tsx
const styles = useThemedStyles(makeTaskCardStyles);
return <AppView style={styles.container} />;
```

A module-level `StyleSheet.create` runs once at import time and therefore cannot read
a reactive theme — that is why token-derived styles are a factory. `useThemedStyles`
returns a stable object per theme; it is the canonical legitimate exception to
`react.perf.compiler-no-manual-memo`, and its implementation lives in the token layer.

---

## Token layer

```
shared/ui/tokens/
├── primitive/          # Raw scales: palette, spacing, radii, font sizes — profile paths.tokenPrimitives
├── themes/
│   ├── types.ts        # Theme interface contract
│   └── <theme>.ts      # One file per theme declared in the profile
├── typography.ts       # Named text styles
├── ThemeProvider.tsx   # Resolves the theme (and the font-scale-derived tokens)
├── useTheme.ts
├── useThemedStyles.ts  # Factory → memoised StyleSheet per theme
└── index.ts            # Public barrel
```

Token usage in components:

- **Typography** — named styles from `typography`. Never compose
  `{ fontSize, fontWeight, lineHeight }` in a component.
- **Colour** — `theme.colors.*`.
- **Spacing** — `theme.spacing.*`.
- **Shadow** — `theme.shadows.*`.
- **Radius** — `theme.borderRadius.*`.

---

## Navigation

The profile picks the router (`PROJECT-PROFILE.md` → Stack → Navigation).

**React Navigation**

- Route names live in a `ROUTES` constant in `navigation/`; screens are registered and
  navigated to only through it.
- Each navigator has a typed param list; `useNavigation` / `useRoute` are used through
  typed wrappers.

**Expo Router**

- Routes are files, so there is no `ROUTES` constant — use typed routes
  (`experiments.typedRoutes` in the Expo config) instead.
- The route directory is a thin adapter: each route file re-exports a screen from
  `src/screens/<slice>`. No logic in route files.
- Keep the route directory **out of** `src/app/`, which is the FSD `app` layer. Point
  Expo Router at a separate directory (the `root` option of the `expo-router` config
  plugin, e.g. `./src/routes`) and check the option name against your Expo SDK.
- With Expo Router the `navigation` layer holds linking helpers and route-param types;
  it may be nearly empty, which is fine.

---

## Naming additions

| Kind | Convention | Example |
|---|---|---|
| Screen component | `PascalCase` + `Screen` | `TaskListScreen.tsx` |
| Styles module | component name + `.styles.ts` | `TaskCard.styles.ts` |
| Styles factory | `make` + component name + `Styles` | `makeTaskCardStyles` |
| Platform-specific file | `.ios.tsx` / `.android.tsx` suffix | `AppHaptics.ios.ts` |
