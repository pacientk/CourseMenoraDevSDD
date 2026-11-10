# SPEC-{NNN} — Execution plan

## 1. Meta

| Field | Value |
|---|---|
| Epic | [SPEC-{NNN}: {title}](./epic.md) |
| Tasks | [tasks.md](./tasks.md) |
| Status | not-started |
| Created | YYYY-MM-DD |
| Implementer | `react-engineer` agent |
| Stop mode | per-wave — pause after every wave |
| Parallelism | no more than 3 agents per wave |
| Review | independent, `/review`; no more than 2 rounds |

Status: `not-started` → `in-progress` → `completed` / `blocked`. Written by the orchestrator.

## 2. Summary

- **Tasks:** {N}
- **Waves:** {M}
- **Critical path:** {K} tasks

{One paragraph on the shape of the work: what is the foundation, where work fans out in
parallel and where it converges.}

## 3. Dependency graph

```mermaid
flowchart LR
    T001[T-001: {title}]
    T002[T-002: {title}]
    T003[T-003: {title}]
    T001 --> T003
    T002 --> T003
```

Arrow: the source blocks the target.

## 4. Critical path

`T-001 → T-003 → T-005`

Parallelism does not shorten this chain — blockers on it are watched first.

## 5. Dry-run: conflicts before start

### Path overlaps within a wave

| Wave | Tasks | Shared path | Risk | Resolution |
|---|---|---|---|---|
| {1} | {T-001, T-002} | {`src/shared/i18n/he.ts`} | {medium} | {who owns the file / move the task} |

No overlaps — say so: "none".

### External dependencies

- **Packages:** {… or "no new ones"}
- **Environment variables:** {…}
- **External services:** {…}

## 6. Waves

### Wave 1 — {title}

- **Tasks:** T-001, T-002
- **In parallel:** 2 agents
- **Check at the end:** `npm run validate`
- **Expected outcome:** {observable result of the wave}

### Wave 2 — {title}

- **Tasks:** T-003
- **Waits for:** wave 1
- **Check at the end:** `npm run validate`
- **Expected outcome:** {…}

## 7. Gates

Before writing each row, the tool was checked to exist. Anything missing is
`aspirational — not wired`.

| Gate | When | How | Wired |
|---|---|---|---|
| G4 Task DoD | after every task | `npm run validate` + hand-off | {yes} |
| G5 Review | after the last wave | `/review` → `/sdd fix`, up to 2 rounds | {yes / aspirational — not wired} |
| G6 Security | after `APPROVED` | `/security-review`, `npm run audit:deps` | {yes / aspirational — not wired} |
| G7 Spec close | after security | `/sdd close` | yes |
| G8 Build | inside `/sdd close` | `npm run release:check` | yes |
| G9 Release | at the end | `npm run preview` + manual check | yes |

## 8. Execution risks

| Risk | Likelihood | What we do |
|---|---|---|
| {External API unreachable from the network} | {medium} | {`npm run dev:offline`; tests never touch the network} |

## 9. Progress log

Written only by the orchestrator — implementers return their line in the hand-off.

| Task | Wave | Started | Finished | Status | Gate | Notes |
|---|---|---|---|---|---|---|
| T-001 | 1 | | | not-started | | |
