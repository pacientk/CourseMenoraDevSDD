# Report format

Write the report in the language of the request; keep code, paths, rule IDs, and
commands verbatim.

```markdown
## Verdict: CHANGES REQUESTED | APPROVED

Scope: <diff range or files> · Kind: <change review | audit> · Round: <1 | 2 | …> · Mode: <kit (<stack>) | adaptive>
Intent: <the task/spec in one line, or "inferred: …" when no task was given>
Standards applied: <kit manifest + profile | project conventions: CLAUDE.md, eslint config, local patterns in …>

### Gates
| Gate | Command | Result |
|---|---|---|
| Type-check | `npx tsc --noEmit` | ✅ exit 0 / ❌ <first error> / ⚠️ could not run: <why> |
| Lint | `…` | |
| Tests | `…` | |

### Coverage
| Depth | Files |
|---|---|
| Read fully | `path/a.ts`, `path/b.ts` |
| Partially | `path/c.ts` (exports and `reconcile()` only) |
| Not opened | `path/d/**` — reason |
| Probed | `path/a.ts`: create → reconcile → rollback (passed / failed → F-1) |

Stateful seams (when the scope has stateful or async code) — one row per applicable
checklist item, one per variant:

| Seam | Status |
|---|---|
| Id remapping | read: no issue (all three id fields rewritten in `reconcile()`) |
| Rollback after remap (a) | probed: failed → F-1 |
| Rollback after remap (b) | probed: passed |
| Merge vs in-flight write | not checked (budget) |

Outside the scope: <top hotspot modules of the repository not covered by this review,
from `hotspots.sh --modules`, e.g. "`src/features/task-sync` (score 798) — not
reviewed">. Omit this line for a change review whose scope is the whole diff.

### Acceptance criteria   <!-- only when a task or spec was provided -->
| Criterion | Implemented | Tested |
|---|---|---|

### Findings
#### F-1 · blocker · logic · `path/to/file.ts:42`
- **Rule:** — | kit rule ID | `CLAUDE.md § Section` | local pattern in `path/to/example.ts`
- **Problem:** one sentence.
- **Failure scenario:** concrete input/state → wrong result.
- **Fix direction:** what must change — not a full rewrite.

### Previous findings   <!-- re-review only -->
| ID | Status | Evidence |
|---|---|---|
| F-1 | resolved / not resolved / regressed | … |

### Pre-existing (outside scope, not blocking)

### Dismissed as documented   <!-- omit when empty -->
- <scenario> → "<quoted limitation>" (`docs/…/T-005.md:130`) → precondition: same /
  differs · mechanism: same / differs · outcome: no worse / worse

### Suggestions   <!-- optional, at most a few lines; never blocking -->

### Findings for the implementer
- F-1 · blocker · `path/to/file.ts:42` — problem. Fix: direction.
- …
```

## Rules for the report

- **Severity:** blocker (wrong behaviour, data loss, security, failing gate, unmet
  acceptance criterion, a gate claim that does not match reality) · major (rule
  violation with a real cost, untested acceptance criterion, expensive-to-retrofit
  structure) · minor (worth fixing, not blocking) · question (could not confirm).
- **Category:** logic · spec · standards · tests · security · performance.
- **Verdict:** `CHANGES REQUESTED` if any blocker or major; otherwise `APPROVED`. It
  covers only the files listed as read in Coverage — never imply more.
- **Stateful seams** rows are mandatory when they apply; an applicable item with no
  row is an incomplete review. Statuses: `probed: passed`, `probed: failed → F-n`,
  `read: no issue (why)`, `dismissed: documented (quote)`, `not checked (why)`.
- **Dismissed as documented** lists every candidate suppressed by a spec, ADR, or
  comment, with the three-way comparison. A dismissal that is not listed here is not
  allowed.
- **Coverage** is mandatory. "Not opened" and "Outside the scope" are as important as
  findings: they tell the reader where an `APPROVED` stops.
- No finding without a location. No finding without a failure scenario or a cited rule.
- Order findings by severity, then by file.
- If there are no findings, say so in one line — do not pad the report.
- The last section is self-contained: it is pasted as-is into the implementing agent's
  prompt as "findings from earlier review".
