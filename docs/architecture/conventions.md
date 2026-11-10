# Project conventions

A short project profile: what the implementer must know and what the reviewer checks
against. Rule identifiers (`react.ui.tokens` and the like) come from the engineering
standards kit; they are here so that a review finding can point at a specific rule.

The tag in brackets says who catches a violation: **[TS]** — the compiler, **[Lint]** —
oxlint, **[Review]** — review only. Rules tagged [Review] are violated most often:
automation does not see them.

## 1. Layers (Feature-Sliced Design, web)

```
src/
├── app/        bootstrap: root component, router, providers
├── pages/      one slice per route; composition only, no business logic
├── widgets/    large self-contained page blocks (app-header, profile-card)
├── entities/   business entities: types, mapping, requests, hooks (customer)
└── shared/     domain-agnostic infrastructure: ui, api, config, i18n
```

- Imports go downward only: `app → pages → widgets → entities → shared`
  (`arch.fsd.downward-only`) **[Review]**.
- Slices of the same layer do not import each other (`arch.fsd.no-cross-slice`) **[Review]**.
- From the outside, a slice is reachable only through its `index.ts`
  (`arch.fsd.public-api`) **[Review]**. Imports between layers go through the alias:
  `import { ProfileCard } from '@/widgets/profile-card'`.
- No domain vocabulary in `shared`: `Card` — yes, `CustomerCard` — no
  (`arch.fsd.shared-is-business-free`) **[Review]**.
- A server request lives next to the owner of the data: `entities/<entity>/api`
  (`arch.fsd.server-state-in-slice`) **[Review]**.

Slice names are `kebab-case` (`profile-card`), component folders are `PascalCase`.

## 2. Components

A component's files live together. In a slice with a single component — directly in the slice folder:

```
widgets/profile-card/
├── index.ts                    the only external entry point
├── ProfileCard.tsx
├── ProfileCard.module.css
├── IProfileCard.ts             IProfileCardProps
└── __tests__/ProfileCard.test.tsx
```

`shared/ui` has many components, so each gets its own folder of the same shape
(`shared/ui/Card/…`), and `shared/ui/index.ts` re-exports them all.

- Props are a named interface `I<Component>Props` in the file `I<Component>.ts`
  (`react.comp.props-file`) **[Review]**.
- A component reads a hook and renders. Computations and requests belong in hooks, not in the render body
  (`react.comp.no-logic-in-render`) **[Review]**.
- A component is not declared inside another component
  (`react.comp.no-nested-components`) **[Lint]**.
- List keys are domain identifiers, not the index (`react.comp.stable-keys`) **[Review]**.
- Booleans carry the prefix `is / has / should / can`
  (`core.naming.boolean-prefix`) **[Review]**.
- No `any`, no `!`, no unchecked `as` (`core.ts.no-any`, `core.ts.no-non-null`,
  `core.ts.assertions`) **[TS + Review]**.

## 3. Styles, design tokens, RTL

- Styles go in `<Component>.module.css`. An inline style is allowed only for a value
  that is computed on every render.
- Colors, spacing, radii, shadows, font sizes and weights, border width —
  only `var(--token)` from `src/shared/ui/tokens.css`. A literal `#6436DF` or `16px` in
  a component is a violation (`react.ui.tokens`) **[Review]**. If the needed token does not exist, that is
  a question for the spec, not a reason to write in a number.
- A component without props has no `I<Component>.ts` file.
- Direction is RTL. Logical properties only: `margin-inline-start`,
  `padding-inline`, `inset-inline-end`, `text-align: start`. `left` / `right` /
  `margin-left` are a violation **[Review]**.

## 4. Strings

All user-facing text lives in `src/shared/i18n/he.ts`. In components and tests —
a reference to the dictionary, not a literal (`react.ui.strings`) **[Review]**. This also applies to
`aria-label` and error texts.

## 5. Accessibility

- Every interactive element has a role and an accessible name
  (`react.a11y.interactive`) **[Review]**.
- Semantics before ARIA: `nav`, `main`, `header`, `h1…h3`, `button`, `a`.
- Loading and error states are announced: `aria-busy`, `role="status"`,
  `role="alert"`.
- Focus is visible (the style is already set in `global.css`), focus order matches the visual order.

## 6. Data and state

- There is no global store. Server data is not copied into local state
  "just in case" (`react.state.server-not-in-client-store`) **[Review]**.
- The chain: `shared/api` (HTTP client) → `entities/<entity>/api` (request) →
  `entities/<entity>/model` (type, mapper, hook) → widget.
- A loading hook returns a discriminated union, not a set of boolean flags:
  `{ status: 'loading' } | { status: 'success', data } | { status: 'not-found' } | { status: 'error' }`.
- An effect that issues a request cancels it on unmount and on argument change
  (`AbortController`); a late response does not overwrite a fresh one
  (`react.hooks.effect-cleanup`) **[Review]**.
- Every promise is handled (`core.ts.no-floating-promises`) **[Review]**.
- A server error is an error: a non-2xx response becomes a typed
  exception, not "empty data".

## 7. Security

An API response is untrusted input. DummyJSON returns `password`, `ssn`,
`bank`, `ip`, `macAddress`, `crypto` along with the profile.

- **Allowlist.** Only the fields of the `Customer` model listed in the spec leave
  `entities/customer`. The mapper takes `unknown`, checks the shape and
  builds the model field by field. Spreading the raw response (`{ ...dto }`) is forbidden
  **[Review]**.
- Raw responses and personal data do not end up in `console.*`
  (`core.sec.no-pii-in-logs`) **[Review]**.
- An external URL is validated before use: an image address — `https://` only,
  an identifier in the request path — a positive integer only
  (`core.sec.validated-urls`) **[Review]**.
- No `dangerouslySetInnerHTML`, no `eval` (`core.sec.no-eval`).
- No secrets in the repository (`core.sec.no-secrets`). `.env` contains only
  the public API address; it is read in one place — `src/shared/config/env.ts`.

## 8. Tests

- Vitest + Testing Library. A test lives in `__tests__/` next to the code.
- We test behavior, not implementation: query by role and accessible name, not by
  class and not by `data-testid`.
- Every acceptance criterion is covered by a test that fails if the criterion is broken.
- A positive case comes paired with a negative one: "shows X" + "does not show X
  when the condition is not met".
- Tests do not touch the network: `fetch` is replaced via `vi.stubGlobal`. The response
  fixture includes the sensitive fields too — so the test proves they did not leak.
- A test without expectations, `it.skip` without a reason, a check weakened for the sake of a green
  result — all violations.

## 9. Definition of Done

A task is complete when:

1. `npm run validate` is green (types → lint → tests), and the result has been read for every
   step, not just the last line.
2. Every acceptance criterion of the task is covered by an automated test; negative pairs are in place.
3. The checklist in this document has been walked for all affected files.
4. For UI: the page has been opened in a browser and checked against `docs/design/customer-360.png`.
   If the implementer cannot open a browser, they say so explicitly in the hand-off.
5. The hand-off follows the template `.github/skills/sdd/templates/handoff.md`.
