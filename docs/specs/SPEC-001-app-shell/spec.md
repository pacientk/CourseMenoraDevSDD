# SPEC-001 — Application shell: routes, header, navigation

## 1. Meta

| Field | Value |
|---|---|
| ID | SPEC-001 |
| Title | Application shell: routes, header, navigation |
| Track | small-spec |
| Status | approved |
| Created | 2026-11-09 |
| Owner | course lead |

Status: `draft` → `approved` → `done`. The move to `approved` is made by a human.

## 2. Summary

The starter repository shows a single placeholder. To build the customer profile page
on top of it, we need a shell: routes, a shared header with navigation, and empty section pages.
Server data is not part of this spec — it arrives in SPEC-002.

## 3. Goal

After the change, the application opens at `/customers/1`, shows a header with three
menu items, marks the active item, and responds correctly to an unknown address.

## 4. Scope

**In scope:**

- Routing on React Router: `/`, `/customers/:customerId`, `/claims`,
  `/history`, any other path.
- The `app-header` widget: a text brand label and navigation.
- A shared page shell: header + `main` content area.
- The customer page with a heading and an empty area for the SPEC-002 cards.
- Section placeholder pages and a "not found" page.
- Route constants and all new strings in the dictionary.

**Out of scope:**

- Loading and displaying customer data (SPEC-002).
- An image logo, the employee block «ספיר», the active-call indicator.
- Dark theme.
- A separate mobile menu: on a narrow screen the navigation simply wraps to the
  next line.

## 5. Acceptance criteria

- **AC-1** — Given the address `/` is opened, when the application has loaded, then the address
  becomes `/customers/1` and the page has a first-level heading
  «תמונת לקוח 360».
- **AC-2** — Every page has a `nav` with the accessible name «ניווט ראשי» and exactly
  three links in this order: «לקוחות», «תביעות», «היסטוריית קשר».
- **AC-3** — On `/customers/1` the link «לקוחות» has `aria-current="page"`, the other
  two do not. On `/claims` only «תביעות» has `aria-current="page"`.
- **AC-4** — `/claims` and `/history` show a first-level heading with the section
  name and the text «בקרוב».
- **AC-5** — Given an unknown address is opened (for example `/nope`), then the heading
  «הדף לא נמצא» and the link «חזרה לתמונת הלקוח» pointing to `/customers/1` are shown.
- **AC-6** — New components contain no UI string literals, no color or size
  literals, and no physical CSS direction properties (`left`, `right`,
  `margin-left`, etc.).
- **AC-7** — `npm run validate` and `npm run build` complete without errors.

## 6. Implementation notes

### Files

| Path | Action | Purpose |
|---|---|---|
| `src/shared/config/routes.ts` | create | Route constants and the customer path builder |
| `src/shared/i18n/he.ts` | modify | New strings: brand, navigation, headings, placeholders |
| `src/widgets/app-header/` | create | Header: brand label + navigation |
| `src/pages/customer/` | create | Customer page: heading, subheading, area for the cards |
| `src/pages/coming-soon/` | create | Section placeholder; the section name comes in as a prop |
| `src/pages/not-found/` | create | "Not found" page |
| `src/app/AppLayout/` | create | Shell: header + `main` with the nested route |
| `src/app/AppRouter.tsx` | create | Route tree |
| `src/app/App.tsx` | modify | Wire up the router instead of the placeholder |
| `src/app/__tests__/App.test.tsx` | modify | Scenarios of this spec instead of the placeholder test |

### Contracts

```ts
// src/shared/config/routes.ts
export const DEFAULT_CUSTOMER_ID = 1

export const ROUTES = {
  root: '/',
  customer: '/customers/:customerId',
  claims: '/claims',
  history: '/history',
} as const

export declare function customerPath(customerId: number): string // '/customers/1'
```

Strings (keys are up to the implementer, texts are mandatory):

| Purpose | Text |
|---|---|
| Brand label | מנורה מבטחים |
| Product label | מרכז שירות |
| Navigation name (`aria-label`) | ניווט ראשי |
| Menu items | לקוחות · תביעות · היסטוריית קשר |
| Customer page heading | תמונת לקוח 360 |
| Customer page subheading | כל המידע לשיחה, במקום אחד |
| Section placeholder | בקרוב |
| "Not found" page | הדף לא נמצא · חזרה לתמונת הלקוח |

### Behavior requirements

- The «לקוחות» item is active on any address of the form `/customers/…`.
- The router is created in `App`, and the route tree is a separate component, so that tests
  can wrap it in a `MemoryRouter` with the required initial address.
- The customer page does not read data yet; it will receive and validate the `customerId`
  parameter in SPEC-002.
- The header layout is checked against `docs/design/customer-360.png` and the classes `.app-header`,
  `.brand-label`, `.header-nav`, `.nav-link` in the HTML reference.

### Dependencies

`react-router` is already installed. No new packages or environment variables.

## 7. Tests

### Strategy

Integration tests at the route-tree level: `MemoryRouter` with an initial address,
queries by role and accessible name. Separate unit tests for the placeholders are not needed.

### Main scenarios

- **S-1** — Given the initial address `/` / Then the heading «תמונת לקוח 360» is visible —
  covers AC-1.
- **S-2** — Given any address / Then the «ניווט ראשי» navigation has three links in the given
  order — covers AC-2.
- **S-3** — Given `/customers/1` / Then `aria-current="page"` only on «לקוחות»;
  Given `/claims` / Then only on «תביעות» — covers AC-3 (positive and negative).
- **S-4** — Given `/history` / Then the heading «היסטוריית קשר» and the text «בקרוב» —
  covers AC-4.
- **S-5** — Given `/nope` / Then the heading «הדף לא נמצא» and a link with
  `href="/customers/1"` — covers AC-5.

### Additional scenarios (filled in by the implementer)

- (empty)

### Manual check

- [ ] `npm run dev`, open `http://localhost:5173` — the address has changed to
      `/customers/1`.
- [ ] The header visually matches `docs/design/customer-360.png`: brand label
      on the right, menu in the center, active item highlighted.
- [ ] Navigating the three menu items with the keyboard (Tab, Enter), focus is visible.

## 8. Open questions

- none

## 9. Execution log

Filled in by the orchestrator after the implementer's hand-off.

| Date | Event | Result |
|---|---|---|
| | | |
