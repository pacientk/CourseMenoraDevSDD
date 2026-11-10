# Security checklist (security review)

Use it on the branch diff. Follow data from where it enters (API response, URL
parameter, environment variable) to where it leaves (screen, log, network request).
Only a concrete scenario becomes a finding.

## Data exposure

- **Allowlist mapping.** The API returns more than the app needs (`password`, `ssn`,
  `bank`, `ein`, `crypto`, `ip`, `macAddress`, …). Does every response pass through a
  mapper that copies named fields only? Any spread (`...response`), `Object.assign` or
  pass-through of the raw object past the data layer is a `high` finding.
- **Logging.** Any `console.*` or error report that prints a response object, a model
  object or a URL with personal data? Errors must log status and message, not bodies.
- **Rendering.** Is any field shown that the spec did not list? Does any component
  accept the raw API object as a prop?
- **Storage.** Is personal data written to `localStorage`, `sessionStorage`, cookies or
  the URL?

## Injection and rendering

- `dangerouslySetInnerHTML`, `innerHTML`, `document.write`, `eval`, `new Function`.
- URLs built from data: `href`, `src`, `window.open`, `fetch(url)` — is the scheme
  checked (`https:` only), is the identifier validated before it is interpolated into a
  path?
- Images from the API (`image` field): is the origin restricted, is there a fallback
  when the URL is invalid?
- Route parameters (`:customerId`): validated before use in a request? What happens
  with `abc`, `-1`, `1e9`, a 500-character string?

## Network

- Base URL from `VITE_API_BASE_URL` only; no hard-coded hosts, no `http:`.
- Error handling that distinguishes 404, 5xx and network failure without exposing
  response bodies to the user.
- Request cancellation on unmount or parameter change (stale responses are a
  correctness and a privacy issue: customer A's data shown under customer B's id).

## Secrets and configuration

- No tokens, keys or credentials in the diff, in `.env` files that are committed, or in
  test fixtures.
- `.env.example` documents variables without values.

## Dependencies

- `npm run audit:deps` — record the real output. A `high` or `critical` vulnerability
  without a resolution is a `high` finding.
- No new dependency outside the approved spec (`AGENTS.md § Rules`).

## Tests

- Is there a test proving that the sensitive fields never reach the model (for example,
  mapping a fixture that contains `password` and asserting the result has no such key)?
  Absence is a `medium` finding when the spec requires the allowlist.
