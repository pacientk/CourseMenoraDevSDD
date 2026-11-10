# Implementer hand-off

The implementer returns this report at the end of a task. Every slot is filled: an empty
slot means the task is not finished. The report is a set of claims that the orchestrator
and the reviewer re-check, so it contains facts and real command output, not opinions.

```markdown
## Hand-off — {SPEC-NNN} / {T-NNN or "small spec"}: {title}

**What was done:** {one paragraph: what changed and why this way}

**Files:**
- created: `{path}`, `{path}`
- changed: `{path}` — {what exactly}

**Acceptance criteria:**
| AC | Implemented | Test (file → test name) |
|---|---|---|
| AC-1 | yes | `src/…/__tests__/X.test.tsx` → "shows …" |

**Gates — real result of every command:**
| Gate | Command | Result |
|---|---|---|
| Types | `npm run typecheck` | {exit 0 / first error} |
| Lint | `npm run lint` | {0 errors, N warnings} |
| Tests | `npm run test` | {N files, M tests, all green} |

**Additional scenarios:** {edge cases found and their tests — or "none"}

**Browser check:** {what was opened and compared — or
"could not check UX — a human needs to look at <route>"}

**Deviations from conventions:** {rule, location, justification — or "none"}

**Found but not touched:** {defects and doubts outside the task's scope — or "none"}

**Responses to review findings** (fix round only):
| ID | Status | Where / evidence |
|---|---|---|
| F-1 | fixed / answered / disputed | {…} |

**Progress log line:** {T-NNN | wave | completed / blocked | note}
```
