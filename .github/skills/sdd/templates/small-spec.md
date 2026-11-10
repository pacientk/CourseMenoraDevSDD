# SPEC-{NNN} — {Title}

## 1. Meta

| Field | Value |
|---|---|
| ID | SPEC-{NNN} |
| Title | {short title} |
| Track | small-spec |
| Status | draft |
| Created | YYYY-MM-DD |
| Owner | {name} |

Status: `draft` → `approved` → `done`. A human moves it to `approved`.

## 2. Summary

{One paragraph: what we change and why. Enough context for the agent and a future reader
to understand the motivation without opening other files.}

## 3. Goal

{One sentence with a verifiable outcome: "After the change, … happens".}

## 4. Scope

**In scope:**

- {…}

**Out of scope:**

- {… — this section cannot be empty}

## 5. Acceptance criteria

Observable conditions. Behaviour in Given / When / Then form; structure as a checklist.

- **AC-1** — {Given … when … then …}
- **AC-2** — {…}

## 6. Implementation notes

Contracts, not code: types, schemas, tables. No function bodies here.

### Files

| Path | Action | Purpose |
|---|---|---|
| `{src/…}` | create / change | {…} |

### Contracts

```ts
{type and signature declarations, if needed}
```

### Dependencies

{New packages and environment variables — or "none".}

## 7. Tests

### Strategy

{What we automate and at which level.}

### Primary scenarios

3–5 mandatory scenarios, each covering an AC.

- **S-1** — {Given / When / Then} — covers AC-1
- **S-2** — {…}

### Additional scenarios (filled in by the implementer)

- (empty)

### Manual check

Only what automation does not cover. For UI — a pass in the browser.

- [ ] {…}

## 8. Open questions

- {… or "none"}

## 9. Execution log

Filled in by the orchestrator after the implementer's hand-off.

| Date | Event | Result |
|---|---|---|
| | | |
