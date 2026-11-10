# Review log — SPEC-{NNN}

Every round of the independent review and the result of the security gate. Do not rename
the field keys — the log is read by searching for them. Enumerated fields hold the value
only; explanations go into the findings.

reviewer: /review (code-reviewer agent, read-only)
round_limit: 2

---

<!-- Review round — one block per round:

## Round {n} — {YYYY-MM-DD}
scope: {diff range or files}
verdict: {APPROVED | CHANGES REQUESTED}
gates: {typecheck ok · lint ok · test ok — per the reviewer's report}
findings:
  - id: F-1
    severity: {blocker | major | minor | question}
    category: {logic | spec | standards | tests | security | performance}
    location: {path:line}
    problem: {one sentence}
    response: {open | fixed (where) | answered | disputed (evidence)}

Human decision when the round limit is exhausted:

## Decision — {YYYY-MM-DD}
decision: {accepted-with-reason | extra-round | spec-rework}
reason: {why}
decided_by: {name}

Security gate:

## Security — {YYYY-MM-DD}
tool: /security-review
result: {no findings | findings}
audit: {npm run audit:deps → 0 high}
findings:
  - severity: {high | medium | low}
    location: {path:line}
    problem: {one sentence}
    resolution: {fixed | accepted (reason) | deferred}
-->
