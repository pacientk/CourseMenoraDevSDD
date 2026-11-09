# React Native Rules

**Layer:** react-native — enforceable rules specific to React Native. Implements the
platform halves of `docs/react/rules.md`. Rule IDs are referenced from
`configs/eslint/react-native.mjs`.

---

## UI primitives and styles

### `rn.ui.atoms-only` — raw RN components only in atoms **[ESLint: error]**

Implements `react.ui.primitives`. Importing `View`, `Text`, `ScrollView`, `Pressable`,
`Image`, `ImageBackground`, `TextInput`, the `Touchable*` family, `FlatList`,
`SectionList`, `VirtualizedList`, `Button`, or `Switch` from `react-native` is blocked
outside `paths.atoms`. The `Touchable*` and list entries matter as much as `View`: they
are the usual way around the rule.

### `rn.styles.module` — styles live in `<Component>.styles.ts` **[ESLint: error]**

Importing `StyleSheet` into a `.tsx` file is blocked, so a style sheet cannot be
declared next to the markup. Constants such as `StyleSheet.hairlineWidth` and
`StyleSheet.absoluteFill` are used inside the styles module too.

Styles modules are exempt from `core.ts.explicit-boundary-types`: a factory's return
type is whatever `StyleSheet.create` infers, and spelling it out adds noise, not
safety.

### `rn.styles.no-inline-literals` — no literal inline styles **[ESLint: error]**

```tsx
// Wrong
<AppView style={{ marginTop: 16, backgroundColor: '#fff' }} />
```

**What lint does not catch.** `react-native/no-inline-styles` flags inline objects
with *literal* values only. A token-derived inline object such as
`{ gap: theme.spacing.xs }` passes lint and is caught in review — see the next rule.

### `rn.styles.placement` — how a style reaches an element **[Review]**

1. **Structural or token-derived, non-stateful** → a named key in the factory.
2. **State that is itself a theme constant** (checked/unchecked fill, selected font) →
   named variants in the factory, chosen by a boolean or a lookup:
   `[styles.box, isChecked ? styles.boxChecked : styles.boxUnchecked]`.
3. **Genuinely computed per render** (an animated value, a runtime percentage, a colour
   returned by a resolver) → a narrow inline object. This is the only permitted inline
   style — the documented exception, not a loophole.

### `rn.styles.no-color-literals` — no colour literals in styles **[ESLint: error]**

Colours come from `theme.colors.*`. Numeric design literals are caught by
`core.const.no-magic-numbers`, which checks object literal values; token primitive
directories are exempt.

### `rn.tokens.no-scaling-helpers` — no screen-ratio scaling **[Review]**

`scaleWidth`, `scaleHeight`, `moderateScale`, `pxToRem` and similar must not exist.
Design values are authored in device-independent units; React Native already handles
pixel density. Multiplying by a screen-width ratio produces a layout that is wrong on
every device except the one it was tuned on.

### `rn.tokens.font-scale` — layout grows with the OS text size **[Review]**

When the user raises the system text size, layout must grow rather than clip.

- **Where scaling happens:** once, in the `ThemeProvider`. It reads the font scale,
  caps it (`ui.maxFontScale`), and exposes scaled tokens for *vertical rhythm* —
  minimum heights, vertical padding, gaps between stacked text. Components consume
  those tokens as-is and never compute a multiplier themselves. This is not a scaling
  helper: the input is accessibility settings, not screen width.
- **What stays raw:** horizontal padding, corner radii, icon glyph sizes, border widths.
- `<Prefix>Text` and `<Prefix>TextInput` apply the same cap through
  `maxFontSizeMultiplier`.
- Containers holding text use `minHeight`, never a fixed `height`.

---

## Accessibility

### `rn.a11y.required-props` — the pressable primitive requires role and label **[TS]**

Implements `react.a11y.interactive`. `I<Prefix>PressableProps` declares
`accessibilityRole` and `accessibilityLabel` as **required**, so an unlabelled
interactive element does not compile. Since raw `Pressable` is banned outside atoms,
this covers every tap target in the app.

React Native also accepts the web-aligned `role` and `aria-label` props. Pick one
family per project and use it in every primitive; mixing them makes review harder.

### `rn.a11y.touch-target` — visual size is not the touch target **[Review]**

An element's visual size is whatever the design says. The accessibility floor —
44 pt on iOS, 48 dp on Android — is reached through hit area (`hitSlop`) inside
`<Prefix>Pressable`, never by inflating the visual. No component hard-codes a touch
minimum, and the floor is never multiplied by the font scale.

Caveat: on Android a hit area that extends past its **parent's** bounds does not
receive touches. When a small target sits flush against a clipping parent, give the
parent room (padding) rather than trusting `hitSlop`.

---

## Text direction

Only relevant when the profile sets `ui.rtl: true`.

### `rn.rtl.logical-properties` — use start/end, never left/right **[Review]**

```ts
// Right — logical properties follow the layout direction
paddingStart: theme.spacing.md,
marginEnd: theme.spacing.sm,
start: 0,
borderTopStartRadius: theme.borderRadius.md,

// Wrong — physical properties only mirror while the global left/right swap is on,
// which is a setting, not a contract
paddingLeft: theme.spacing.md,
```

- Text: leave `textAlign` at its default (`auto`), which follows the writing direction.
  An explicit `'left'`/`'right'` must be checked on a device in an RTL locale.
- `flexDirection: 'row'` already mirrors in RTL. Never reverse arrays or swap icons by
  hand to "fix" direction.
- Exception: content that must stay physically LTR in every locale — account numbers,
  amounts, code — sets `writingDirection: 'ltr'` explicitly.

### `rn.rtl.no-manual-branching` — no `I18nManager` outside the i18n service **[ESLint: error]**

```ts
// Wrong
textAlign: I18nManager.isRTL ? 'right' : 'left'
const tabs = I18nManager.isRTL ? [...TABS].reverse() : TABS;
```

Manual branching fights native mirroring and usually flips twice. Importing
`I18nManager` is blocked outside `paths.i18nService`.

---

## Platform seams

### `rn.platform.linking` — `Linking` only through a validating service **[ESLint: error]**

Implements `core.sec.validated-urls`. Importing `Linking` is blocked outside
`paths.linkingService`. The service validates scheme and host before opening anything —
an unvalidated URL is an injection surface.

### `rn.platform.single-theme` — no OS-appearance APIs in a single-theme app **[ESLint: error]**

Implements `react.ui.declared-themes-only`. When `ui.themes` is `"single"`,
`useColorScheme` and `Appearance` are blocked everywhere.

### `rn.platform.i18n-library` — the i18n library only inside the i18n service **[ESLint: error]**

When `i18n.library` is set, importing it is blocked outside `paths.i18nService`. The
rest of the app uses the project's translation hook — one seam, not many.

---

## Performance

These are structural decisions, exempt from YAGNI — expensive to retrofit once the app
has grown callers.

### `rn.lists.recycling` — scrollable data goes through the list atom **[ESLint + Review]**

- Every scrollable data list uses `<Prefix>List`, which wraps the implementation chosen
  in the profile. A recycling list (`@shopify/flash-list`, which from v2 requires the
  New Architecture) is the recommended default: recycling views instead of mounting
  and unmounting them is the difference between a smooth and a janky feed on a low-end
  device.
- If the list atom does not exist yet when you need a list, creating it is part of your
  task. Do not fall back to a raw list "for now" — lint blocks it anyway.
- A genuinely fixed, non-scrolling collection (three to five static rows that cannot
  grow) may be mapped inside a scroll view. Virtualisation has overhead too.
- `keyExtractor` returns a stable domain id (`react.comp.stable-keys`).
- `renderItem` is a named function or a stable component reference, never an inline
  closure that declares a component.
- Rows are their own components, so their props stay narrow and the compiler (or
  `memo`, if the compiler is off) can skip unchanged rows.

### `rn.anim.ui-thread` — animations run on the UI thread **[Review]**

Reanimated worklets, or `Animated` with `useNativeDriver: true`. Never animate through
`setState` loops. A layout property that cannot go native needs a design rethink, not a
JS-thread animation.

---

## Checklist

- [ ] No raw RN components outside atoms; no `StyleSheet` in `.tsx`
- [ ] Styles in `<Component>.styles.ts`: factory for token-derived, static sheet otherwise
- [ ] Inline styles only for genuinely per-render values
- [ ] No colour or numeric design literals; no scaling helpers
- [ ] Text containers use `minHeight`; font scaling comes from the theme
- [ ] Every pressable has role and label (the compiler enforces it)
- [ ] RTL (if in scope): logical properties, no `I18nManager` branching
- [ ] Lists through the list atom with domain-id keys and named `renderItem`
- [ ] Animations on the UI thread
- [ ] UI work verified on a simulator or device for at least the golden path
