# Logic checklist (Pass A)

Use it to generate attack ideas, not as a form to fill in. For each changed unit: state
what it must do, then try to make it do something else. Only a concrete failure scenario
becomes a finding.

---

## Inputs and data

- Empty string, empty array, `null`, `undefined`, `0`, negative, `NaN`, very large.
- Duplicates; unsorted input where sorted is assumed; unicode, emoji, RTL text, very long
  strings in UI.
- Server responses: missing fields, extra fields, wrong type, empty list vs `null`,
  pagination end, error body with a 200 status.
- Numbers: off-by-one in ranges and pagination, integer vs float, rounding of money
  (floats for currency), division by zero, locale-dependent parsing.
- Dates: time zones, DST, day boundaries, "today" computed once at module load, string
  comparison of dates, `Date` months being 0-based.
- Identity vs equality: comparing objects by reference after a refetch; mutating an
  object that is shared or held in state.

## State

- Every UI state reachable and rendered: loading, error, empty, partial, stale, success.
- Contradictory state combinations (`isLoading && error && data`) — prefer a
  discriminated union.
- State derived and stored separately from its source drifts — derive it instead.
- Cache invalidation after a mutation: does the list show the new item? Does the detail
  screen show the edit?
- Optimistic updates: rolled back on failure?
- Persistence: migrations of stored shape, what happens with data written by the
  previous app version.

## Async and concurrency

- Two requests in flight; the older one resolves last and overwrites newer data.
- Double tap / double submit: duplicate creation, duplicate payment.
- Retry without idempotency.
- Component unmounts or screen blurs while a promise is pending — state set after unmount,
  navigation after the user left.
- Stale closures: a callback or effect capturing an old value of state or props.
- Timers and subscriptions never cleared; listeners registered twice.
- Promise chains with a missing `await`; `forEach` with an async callback; `Promise.all`
  failing fast where partial success was needed.

## Stateful seams (sync engines, queues, caches, optimistic UI)

Where ids, snapshots, and async boundaries cross, bugs hide from straight reading. Write
the sequence down and probe it.

- **Id remapping.** A temporary/local id replaced by a server id: is *every* field that
  holds the id rewritten — queued entries, rollback snapshots (`previous`, `before`),
  parent references, selection state, navigation params, cache keys? After finding the
  remap, grep for every field that stores the id, including fields of nested snapshot
  objects and flags that travel with it (`isLocalId`), and check each one is rewritten.
- **Rollback after remap.** Two variants — different bugs, check both:
  - **(a)** The create **succeeds** and is reconciled; then a mutation queued behind it
    fails terminally. Does rollback restore the record under the server id, or
    re-insert the snapshot under the local id beside it — a ghost record that no later
    sync removes? Always probe this one when there is a remap and a rollback.
  - **(b)** The create **fails** terminally. What happens to the mutations queued
    behind it — dropped, rolled back, or sent against an id the server never issued?
- **Queued work behind a pending operation.** Update or delete enqueued before the
  create that they depend on has settled.
- **Merge vs in-flight write.** A refetch lands between the server storing a write and
  the client receiving its response: duplicate, lost, or reverted record?
- **Dedupe.** Two records for the same entity after merge — by id, by local id, by
  natural key?
- **Lifecycle vs in-flight loops.** `dispose`, sign-out, or unmount while a drain or
  retry loop is already running: does it stop, or keep sending and committing?
- **Ordering.** FIFO assumed but retries, priorities, or parallel sends reorder it.
- **Persistence boundary.** App killed between "sent" and "committed locally": what does
  the next launch replay?

## Errors

- Every failure path handled and surfaced to the user or the logs — not swallowed by an
  empty `catch` or an unhandled rejection.
- After a failure, state is consistent (no half-applied update, no spinner forever).
- Error messages shown to users contain no internals; logs contain no personal data.
- Errors are not used for control flow on hot paths.

## Contracts

- Callers of a changed function or component still get what they relied on: return
  shape, thrown vs returned errors, sync vs async, `undefined` vs `null`.
- Optional props/params given a default that changes behaviour for existing callers.
- Types that compile but lie: `as` casts, non-null assertions, unchecked index access,
  `JSON.parse` results used as typed, optional chaining hiding a real bug.
- Public API of a module changed without updating its consumers in the same change.

## Security

- Untrusted input reaching URLs, deep links, HTML/WebView, SQL/queries, regexes,
  file paths, `eval`-like APIs, logs.
- Auth: is the check on the server or only hidden in the UI? Tokens stored in plain
  storage? Tokens in logs or URLs?
- Secrets or keys committed or bundled into a client.
- Deep links and navigation params validated before use.

## Performance (only where it is structural)

- Unbounded lists rendered without virtualisation.
- Work inside render or inside a list item that scales with total data size.
- Re-subscription to a whole store where a slice would do.
- N+1 requests; requests in a loop instead of a batch.
- Animations on the JS thread.

## React and React Native specifics

- Effects: missing or wrong dependencies; effect used to derive state; no cleanup; an
  effect that runs on every render because a dependency is a fresh object.
- Keys from indexes in dynamic lists; keys that are not unique.
- Components declared inside components (remount on every render).
- `setState` during render; state updates on unmounted components.
- Navigation params assumed present; screen re-used with different params without
  resetting state.
- Platform differences: behaviour verified only on one OS; `Platform.OS` branches with
  one side untested; permissions denied path.
- Keyboard covering inputs; safe-area insets; font scaling clipping text.
- Accessibility: interactive element without role or label; touch target too small;
  information conveyed only by colour.

## Tests

- Would the test fail if the implementation were deleted or inverted? If not, it
  proves nothing.
- Assertions on behaviour (what the user or caller sees), not on internal calls.
- Each acceptance criterion has a test; each positive case has a negative pair.
- Mocks match real types and real behaviour (a mock that never fails hides error paths).
- Async tests actually await; no assertions inside callbacks that never run.
- Snapshot tests used as the only assertion on logic.
