# SPEC-{NNN} — Tasks

**Epic:** [SPEC-{NNN}: {title}](./epic.md)
**Status:** not-started
**Created:** YYYY-MM-DD

## Task index

| ID | Title | Type | Size | Status | Blocked by | Blocks |
|---|---|---|---|---|---|---|
| T-001 | {…} | feature | S | not-started | — | T-003 |
| T-002 | {…} | feature | M | not-started | — | T-003 |

Type: `feature` / `refactor` / `test` / `infra` / `docs`. Size: `S` — one component or
module; `M` — several files, small design decisions. There is no `L` — such a task is
split.

Status: `not-started` → `in-progress` → `completed` / `blocked`.

## Epic AC traceability

Every epic AC is assigned to at least one task.

| Epic AC | Tasks |
|---|---|
| AC-1 | T-001 |
| AC-2 | T-001, T-003 |

---

## T-{NNN}: {Short title}

### Meta

| Field | Value |
|---|---|
| Type | {feature} |
| Size | {S / M} |
| Status | not-started |
| Scope paths | `{src/…}`, `{src/…}` |
| Blocked by | {T-XXX or —} |
| Blocks | {T-YYY or —} |
| Epic sections | {§5 FR-1, §7, §10 AC-1} |

### Goal

{One sentence with a verifiable outcome.}

### Context

{2–3 sentences: the task's place in the epic, what it unlocks next.}

### In scope

- {…}

### Out of scope

- {… — what a neighbouring task does, so there is no overlap}

### Contracts

Everything needed to implement without opening neighbouring tasks. An interface taken from
another task is quoted here with a note where it comes from.

```ts
{types and signatures}
```

### Files

| Path | Action | Purpose |
|---|---|---|
| `{src/…}` | create | {…} |

### Acceptance criteria

- **AC-1** — {Given … when … then …} *(epic AC-N)*
- **AC-2** — {…}

### Tests

**Primary scenarios** (filled in upfront, 3–5, each covering an AC):

- **S-1** — {Given / When / Then} — covers AC-1
- **S-2** — {negative counterpart of S-1}

**Additional scenarios** (filled in by the implementer as it goes):

- (empty)

**Manual check:**

- [ ] {… or "none — fully automated"}

### References

- Epic: {§N}
- Design: {screenshot block, classes in the HTML reference}
- Conventions: {the sections of `docs/architecture/conventions.md` that matter most here}
