# React Rules

**Layer:** react — enforceable rules shared by every React stack. Platform layers
(`docs/react-native/`, later `docs/react-web/`) implement the platform-specific halves:
which primitives exist, how styles are written, how accessibility is expressed.

Rule IDs are referenced from `configs/eslint/react.mjs`.

---

## Components

### `react.comp.no-nested-components` — never declare a component inside a component **[ESLint]**

```tsx
// Wrong — Row is a new component type on every render of List,
// so React unmounts and remounts the whole row subtree each time
const List = ({ items }: IListProps) => {
  const Row = ({ item }: IRowProps) => <AppText>{item.title}</AppText>;
  return items.map((item) => <Row key={item.id} item={item} />);
};

// Right — a stable component at module level (or in its own folder)
const Row = ({ item }: IRowProps) => <AppText>{item.title}</AppText>;
```

A plain helper *called* as a function (`{renderHeader()}`) does not remount anything —
it is just inlined JSX. It is still discouraged when it grows: extract a component so it
gets a name, props, and its own file.

### `react.comp.no-logic-in-render` — render reads, it does not compute **[Review]**

Derived values become named variables above the `return`; event handlers become named
functions. Business logic lives in a hook.

### `react.comp.file-size` — component file limit **[ESLint]**

`.tsx` files are capped at `limits.componentFileLines` (blank lines and comments
excluded; tests and stories exempt). Over the limit means extracting a sub-component or
a hook.

### `react.comp.one-concern` — one visual concern per component **[Review]**

A form field, a card header, a list row — each is its own component. If a component
does two visually distinct things, split it.

### `react.comp.props-file` — props live in their own file **[ESLint + Review]**

The name and prefix are linted (`core.naming.props-prefix`); the placement in
`I<Component>.ts` is checked in review.

### `react.comp.stable-keys` — keys come from domain ids **[ESLint]**

Never the array index. An index key turns an insertion at the top into a re-render —
and a state mix-up — of every row.

---

## Hooks and effects

### `react.hooks.rules` — Rules of Hooks **[ESLint: error]**

Hooks are called unconditionally at the top level of a component or hook. Dependency
arrays are complete (`exhaustive-deps`) — a suppressed dependency warning needs a
reason like any other disable.

### `react.hooks.effect-cleanup` — effects clean up after themselves **[Review]**

Subscriptions, timers, listeners, and in-flight requests are released in the effect's
cleanup. An effect that only derives state from props is not an effect — compute the
value during render.

---

## State

### `react.state.server-not-in-client-store` — one owner per piece of data **[Review]**

Server data belongs to the server-state library named in the profile, inside the slice
that owns it. Never duplicate it into the client store — two copies of the truth will
disagree after the first refetch.

### `react.state.narrow-subscriptions` — subscribe to the slice you read **[Review]**

A component subscribes to the narrowest piece of state it needs — never the whole
store, never a whole slice for one field. Derived data reads through a selector so
unrelated writes do not re-render.

### `react.state.typed-access` — no store singleton in components **[ESLint]**

Components use typed hooks and selectors, never the store singleton. The store module
path is project-specific, so the ban is declared in the profile's
`extraRestrictedImports` (the template ships with the entry) rather than in a preset.

---

## Performance

The core philosophy holds: no speculative micro-optimisation. The rules below are the
exceptions, because they are structural.

### `react.perf.compiler-no-manual-memo` — let the compiler memoise **[ESLint]**

**Only when the profile sets `react.compiler: true`.** The React Compiler memoises
components and hooks automatically, so importing `useMemo`, `useCallback`, or `memo`
is blocked by lint. An exception is a local disable whose reason states all three:

1. A profiler capture shows real wasted render cost. "It might re-render" is not a
   justification.
2. The compiler demonstrably did not memoise that code. It usually bailed out on a
   Rules-of-React violation — fixing the violation is the correct fix and lets the
   compiler do the work.
3. The value is genuinely expensive **and** what is being stabilised is actually
   referentially stable downstream.

Infrastructure hooks that must return a stable reference (a theme-to-styles bridge, a
context value) are the typical legitimate case; their disable says so.

Two traps that recur in review:

- Memoising an object that is spread into a freshly allocated array one line later. The
  stable reference is destroyed immediately; the memo cost remains.
- `memo` on a component whose re-renders originate **inside** a child — the parent
  never re-rendered in the first place.

The compiler-safety rules of `eslint-plugin-react-hooks` run at `error`, so a purity or
set-state-in-render violation fails the build instead of silently un-optimising the
file. The inverse is not detectable by lint: a file can be warning-free and still bail
out. Only compiler output settles whether a file was memoised.

**When the compiler is off**, hand memoisation is allowed but still requires a
demonstrated render problem rather than a hunch.

---

## UI system

### `react.ui.primitives` — platform elements only inside the primitive layer **[ESLint, per platform]**

Text, containers, pressables, images, and inputs go through the project's primitives
(`ui.componentPrefix` + name). The primitive layer is where theming, font scaling,
touch targets, and accessibility defaults are applied once; every raw element is a
place where all of that silently does not happen. The platform layer defines the
primitive set and the ban list.

### `react.ui.tokens` — design values come from tokens **[ESLint partial + Review]**

Two levels, always:

- **Primitive** tokens carry no meaning (`purple100`, `spacing16`). They exist only
  inside the token layer.
- **Semantic** tokens carry a role (`colors.surface.primary`, `colors.text.disabled`).
  Components consume semantic tokens only.

A component that reaches for a primitive shade has skipped the abstraction that makes
re-theming possible. A missing value means extending the primitive scale and surfacing
it on **every** theme — never inlining a literal, never deriving it by arithmetic from a
neighbouring token. New token groups are universal; component-scoped tokens are
reserved for values with no plausible reuse.

Lint catches colour and numeric literals in styles; semantic-vs-primitive is review.

### `react.ui.theme-check` — verify colour changes in every theme **[Review]**

**When the profile declares more than one theme:** a semantic token and a generic shade
can hold the *same* value in one theme and *different* values in another. Substituting
one for the other type-checks, passes the tests that run against the first theme, and
silently breaks the second. Whenever a diff touches a colour token, read its value in
every theme file before approving.

### `react.ui.declared-themes-only` — themes not in the profile do not exist **[ESLint, per platform]**

If the profile declares a single theme, OS-appearance APIs are banned rather than left
as dormant branches nobody tests.

### `react.ui.strings` — no hardcoded user-facing text **[Review]**

All user-facing strings go through the strings or i18n module, and a new key is added
to every locale the profile declares. Even a project without localisation routes text
through one module, so adding a locale later is a translation task, not a refactor.

### `react.a11y.interactive` — every interactive element is labelled **[TS]**

Every interactive element has an accessible role and label. Enforce it with the type
system: the shared pressable primitive declares the role and label as **required**
props, so an unlabelled button does not compile. The platform layer names the props.

---

## Checklist

- [ ] No component declared inside another component
- [ ] No business logic in render; handlers and derived values are named
- [ ] Props in `I<Component>.ts`, re-exported from the barrel
- [ ] Keys from domain ids
- [ ] Effects clean up; no effect that only derives state
- [ ] Server data owned by the server-state library, not copied into the client store
- [ ] Narrow store subscriptions
- [ ] No hand-written memoisation when the compiler is on, unless justified by a disable
      reason
- [ ] Semantic tokens only; colour changes checked in every declared theme
- [ ] No hardcoded user-facing strings
