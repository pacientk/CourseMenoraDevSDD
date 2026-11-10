# SPEC-003 — Search for another customer

## 1. Meta

| Field | Value |
|---|---|
| ID | SPEC-003 |
| Title | Search for another customer |
| Track | small-spec |
| Status | draft |
| Created | 2026-11-10 |
| Owner | course lead |

Status: `draft` → `approved` → `done`. A human moves it to `approved`.

**Gate G0 — why a small spec.** One widget, one search request in an existing entity, one
mount point on an existing page. The data layer of SPEC-002 (`shared/api`: HTTP client,
typed errors, `useAsyncResource`) is reused without changes. No new model beyond a
four-field search match, no new routes, one implementer in one session.

**Requires:** SPEC-002 in status `done` (the customer page, `shared/api` and
`entities/customer` exist).

## 2. Summary

An employee finishes one call and takes the next. Today the only way to open another
customer is to edit the page address by hand. This spec adds a search field to the
customer page: the employee types a name, sees a short list of matches and, on selection,
lands on that customer's page. The search uses the same open API as the profile and
returns the same sensitive fields — so the allowlist mapper is as mandatory here as it was
in SPEC-002.

## 3. Goal

After the change, on `/customers/:customerId` an employee can type at least two characters
of a customer's name, pick a match with the mouse or the keyboard, and the page navigates
to `/customers/<selected id>` — without the already shown customer card being affected
by the search's loading or error states.

## 4. Scope

**In scope:**

- The `customer-search` widget: label, search input, results list, empty / error / loading
  states, keyboard operation.
- A search request in `entities/customer`: `GET /users/search?q=<text>` with an allowlist
  mapper to a `CustomerMatch` model and a hook with debounce, minimum length and
  cancellation.
- Mounting the widget on the customer page next to the profile card, per the screenshot.
- New strings in the dictionary.
- The offline copy of the API: a `/users/search` route in `mocks/mockApiPlugin.ts` that
  filters `mocks/data/users.json` by first and last name.

**Out of scope:**

- Search by ID number, phone or e-mail (the reference placeholder mentions them; the
  brief asks for name only).
- Pagination, "show more", result highlighting, recent searches.
- Search on other pages (`/claims`, `/history`) or in the header.
- Any change to `shared/api`, `ProfileCard`, `CustomerTasks` or the SPEC-002 model.
- A separate mobile layout: on a narrow screen the search block wraps under the card.

## 5. Acceptance criteria

- **AC-1** — Given the customer page is open, then a `combobox` with the accessible name
  «חיפוש לקוח אחר» is present inside the profile area and its list is collapsed
  (`aria-expanded="false"`).
- **AC-2** — Given the input holds fewer than two characters (including an empty string
  or spaces only), then no request is sent and no list or message is shown.
- **AC-3** — Given the employee types `an` and keeps typing `ann` within 300 ms, then
  exactly one request is sent, with `q=ann`, and it is sent only after a 300 ms pause.
- **AC-4** — Given a response with matches, then a `listbox` named «תוצאות חיפוש» shows
  one `option` per match, in the response order, each with the text "first name last
  name · city", and the combobox has `aria-expanded="true"`.
- **AC-5** — Given a response with an empty `users` array, then the message
  «לא נמצאו לקוחות» is shown and the list is collapsed.
- **AC-6** — Given the request fails (network error, non-2xx), then the message
  «החיפוש נכשל, נסו שוב» is shown, the list is collapsed, and the profile card and the
  tasks card keep their current content and state.
- **AC-7** — Given a request for `ann` is pending and the employee changes the text to
  `anne`, when the `ann` response arrives after the `anne` response, then the list shows
  the `anne` matches (the earlier request is aborted or its result ignored).
- **AC-8** — Given the list is open, when the employee presses `ArrowDown` / `ArrowUp`,
  then the active option moves (reflected by `aria-activedescendant` and
  `aria-selected`); when they press `Enter` on an active option or click an option, then
  the location becomes `/customers/<id>` of that option; when they press `Escape`, then the
  list collapses and the input keeps its text.
- **AC-9** — Given a response whose objects contain `password`, `ssn`, `bank`, `email` and
  `phone`, then the `CustomerMatch` objects contain only `id`, `firstName`, `lastName`,
  `city`, and none of the other fields is rendered or logged.
- **AC-10** — Given a response object with a non-integer or non-positive `id`, or a missing
  name, then that object is dropped from the list and the other matches are shown.
- **AC-11** — Given the text contains characters such as `&`, `?`, `#` or Hebrew letters,
  then the request URL carries it URL-encoded in the `q` parameter.
- **AC-12** — New components contain no UI string literals, no colour or size literals and
  no physical CSS direction properties; `npm run validate` and `npm run build` pass.

## 6. Implementation notes

### Files

| Path | Action | Purpose |
|---|---|---|
| `src/entities/customer/model/customerMatch.ts` | create | `CustomerMatch` type and the allowlist mapper for a search response |
| `src/entities/customer/api/searchCustomers.ts` | create | `searchCustomers(query, signal)` over `getJson` from `shared/api` |
| `src/entities/customer/model/useCustomerSearch.ts` | create | hook: trim, minimum length, debounce, cancellation, `SearchState` |
| `src/entities/customer/index.ts` | modify | export `CustomerMatch`, `useCustomerSearch` |
| `src/entities/customer/**/__tests__/` | create | mapper, `searchCustomers`, hook tests |
| `src/shared/lib/useDebouncedValue.ts` | create | generic debounce hook (no domain vocabulary) |
| `src/shared/i18n/he.ts` | modify | new strings (table below) |
| `src/widgets/customer-search/` | create | `CustomerSearch.tsx`, `ICustomerSearch.ts` (if props are needed), `CustomerSearch.module.css`, `index.ts`, tests |
| `src/pages/customer/` (page component and its stylesheet, as created in SPEC-002) | modify | mount `CustomerSearch` next to `ProfileCard`; two-column profile area per the screenshot |
| `mocks/mockApiPlugin.ts` | modify | `/users/search?q=` route over `users.json` |

### Contracts

```ts
// entities/customer/model/customerMatch.ts
export interface CustomerMatch {
  id: number
  firstName: string
  lastName: string
  city: string
}
// Takes the raw response as unknown; returns only valid matches, in response order.
export declare function mapCustomerMatches(input: unknown): CustomerMatch[]

// entities/customer/api/searchCustomers.ts
// GET /users/search?q=<encodeURIComponent(query)> via getJson from '@/shared/api'
export declare function searchCustomers(query: string, signal: AbortSignal): Promise<CustomerMatch[]>

// entities/customer/model/useCustomerSearch.ts
export type SearchState =
  | { status: 'idle' }                              // fewer than 2 characters
  | { status: 'loading' }
  | { status: 'success'; matches: CustomerMatch[] } // may be empty
  | { status: 'error' }
export declare function useCustomerSearch(query: string): SearchState
// trims the query; debounce 300 ms; minimum 2 characters; aborts the previous request
// on change and on unmount; a late response never overwrites a newer one.

// shared/lib/useDebouncedValue.ts
export declare function useDebouncedValue<T>(value: T, delayMs: number): T

// widgets/customer-search/index.ts
export { CustomerSearch } // no props: reads nothing from the route, navigates with useNavigate + customerPath
```

Reused without changes: `getJson`, `HttpError`, `NetworkError` from `@/shared/api`;
`customerPath` from `@/shared/config/routes`; `Card` from `@/shared/ui` as the block
container if the page layout needs it.

Strings (keys are up to the implementer, texts are mandatory):

| Purpose | Text |
|---|---|
| Field label and combobox name | חיפוש לקוח אחר |
| Input placeholder | שם פרטי או שם משפחה |
| Results list name (`aria-label`) | תוצאות חיפוש |
| Empty result | לא נמצאו לקוחות |
| Request error | החיפוש נכשל, נסו שוב |
| Loading announcement (`role="status"`) | מחפש… |

### Behaviour requirements

- Combobox pattern: `input` with `role="combobox"`, `aria-expanded`, `aria-controls`
  pointing at the `listbox`, `aria-activedescendant` for the active option;
  `autocomplete="off"`. Options are `role="option"` with `aria-selected`.
- The list opens only in the `success` state with at least one match; `Escape` closes it
  without clearing the input; the list is also collapsed when the input loses focus.
- Selection navigates with `useNavigate()` to `customerPath(match.id)` and clears the
  input. Nothing else on the page is touched: `ProfileCard` and `CustomerTasks` react to
  the new route parameter as they already do.
- Loading, empty and error messages are inside the widget, below the input, and are
  announced via `role="status"` (loading, empty) or `role="alert"` (error).
- Visual reference: the block `.customer-search` to the left of the profile details in
  `docs/design/customer-360.png`; classes `.search-label`, `.search-wrap`,
  `.search-results` in the HTML reference. Tokens only, logical properties only.
- Offline mock: `/users/search` matches `q` case-insensitively against `firstName` and
  `lastName`; `q` shorter than two characters returns an empty list; the response shape
  is `{ users, total, skip, limit }` with the full user objects, sensitive fields
  included — the mapper must drop them.

### Dependencies

No new packages or environment variables.

## 7. Tests

### Strategy

Unit tests for the mapper and the hook (fake timers for the debounce, stubbed `fetch`
with controllable resolution order for the race). Integration tests for the widget inside
a `MemoryRouter` and a route that renders the current location, so that navigation is
observable. One page-level test proves that a search error leaves the profile card as it
was. Queries by role and accessible name; fixtures contain the sensitive fields.

### Primary scenarios

- **S-1** — Given one character typed / Then no `fetch` call and no list — covers AC-2.
- **S-2** — Given `an` then `ann` typed within 300 ms / When 300 ms pass / Then exactly one
  `fetch` call whose URL contains `q=ann` — covers AC-3.
- **S-3** — Given a response with two users (fixture includes `password`, `ssn`, `bank`) /
  Then two options with "first name last name · city", `aria-expanded="true"`, and the
  rendered HTML contains none of the sensitive values — covers AC-4, AC-9.
- **S-4** — Given a response with `users: []` / Then «לא נמצאו לקוחות» and no listbox;
  Given a 500 response / Then «החיפוש נכשל, נסו שוב» — covers AC-5, AC-6 (pair).
- **S-5** — Given the `ann` request resolves after the `anne` request / Then the options
  are the `anne` matches — covers AC-7.
- **S-6** — Given an open list / When `ArrowDown`, `Enter` / Then the location is
  `/customers/<id of the first option>`; When `Escape` / Then `aria-expanded="false"` and the
  input text is unchanged — covers AC-8 (positive and negative).
- **S-7** — Given a response object with `id: 'x'` and another with a missing `lastName`
  among valid ones / Then only the valid matches are listed — covers AC-10.
- **S-8** — Given the query `a&b ?` / Then the request URL contains `q=a%26b%20%3F` —
  covers AC-11.
- **S-9** — Page level: Given the customer card is in `success` / When the search request
  fails / Then the card still shows the customer's name and the error message is inside
  the search block — covers AC-6.

### Additional scenarios (filled in by the implementer)

- (empty)

### Manual check

- [ ] `npm run dev` (or `npm run dev:offline`), open `/customers/1`, type `em` — a list
      appears after a short pause; arrow keys move the highlight; `Enter` opens the
      selected customer; the card and the tasks update.
- [ ] Type `zz` — «לא נמצאו לקוחות». Stop the network (DevTools → Offline), type `an` —
      the error message, the card unchanged.
- [ ] The block matches the screenshot: label above the field, icon at the start, the list
      under the field; RTL alignment correct; focus ring visible.
- [ ] Network panel: no request for one character; one request per pause, not per key.

## 8. Open questions

- The reference label reads «חיפוש לקוחה אחרת» (feminine); the brief says «חיפוש לקוח
  אחר». Resolved in favour of the brief, as in SPEC-002.
- Result limit: DummyJSON returns up to 30 users per page. The widget shows what comes
  back; capping the list is a UX decision deferred to a later spec.

## 9. Execution log

Filled in by the orchestrator after the implementer's hand-off.

| Date | Event | Result |
|---|---|---|
| 2026-11-10 | Spec prepared by the course lead as a ready draft | awaiting approval (gate G1) by the person who will run it |
