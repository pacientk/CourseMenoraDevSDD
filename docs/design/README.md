# Design reference

| File | What it is | How to use it |
|---|---|---|
| `customer-360.png` | Screenshot of the target page «תמונת לקוח 360» | Look at it: composition, hierarchy, states |
| `customer-360.reference.html` | Original markup and CSS of the page (embedded fonts and images stripped out) | `grep` by class only. **Do not read it whole** — 60 KB |
| `src/shared/ui/tokens.css` | Design tokens, already carried over from the reference | Use via `var(--token)` |

## How to search the HTML reference

```sh
grep -n "\.app-header\|\.nav-link" docs/design/customer-360.reference.html     # header and navigation
grep -n "\.profile-card\|\.customer-layout\|\.profile" docs/design/customer-360.reference.html
grep -n "\.card {" -A 12 docs/design/customer-360.reference.html               # base card
grep -n "\.status\|\.skeleton" docs/design/customer-360.reference.html         # badges and skeleton
```

## What goes into the course and what does not

| Block on the screenshot | Where it is implemented |
|---|---|
| Header: brand label, navigation (לקוחות / תביעות / היסטוריית קשר) | SPEC-001 |
| Page heading «תמונת לקוח 360» | SPEC-001 |
| Customer card: avatar, name, contacts | SPEC-002 |
| Customer task list (based on «פניות אחרונות») | SPEC-002 |
| Search for another customer | SPEC-003 (self-study) |
| Claim, call documentation, policies, benefits, offers | outside the course |

The «Simpler Pro» font is not part of the repository — the fallback stack from the
`--font-sans` token is used. The logo is not used: the header has a text label.

The data on the screenshot is demo data. In the course, data comes from the open
DummyJSON API, so names and task texts will be in English — that is expected.
