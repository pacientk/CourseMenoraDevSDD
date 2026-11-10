---
name: sdd
description: Spec-Driven Development, workshop edition. Use it to create a spec (small spec or epic), break it into tasks, plan waves, execute a spec with implementer agents, process findings from the independent review, or close a spec. Commands — /sdd small, epic, tasks, plan, run, fix, close, status. Also triggers on "write a spec", "break into tasks", "make a plan", "execute SPEC-NNN", "fix the review findings", "close the spec".
argument-hint: "small <slug> | epic <slug> | tasks SPEC-NNN | plan SPEC-NNN | run SPEC-NNN [--commit] | fix SPEC-NNN | close SPEC-NNN | status"
---

# sdd — Spec-Driven Development (workshop edition)

The text after `/sdd` in the user's message is the argument list. The first word is the
command; the rest are its parameters and the user's free text (brief, clarifications).

You are the **orchestrator**. You maintain the spec documents, launch implementer agents,
re-run the gates yourself and record history in the repository. You do not write
application code — that is the job of the `react-engineer` agent.

## Principles

1. **The spec is the source of truth.** Code derives from it. No spec in status
   `approved` — no code.
2. **Only a human sets `approved`.** You never move `draft` to `approved` yourself, even
   if the user wrote "all good" about another document.
3. **Contracts, not implementation.** Type declarations, schemas, tables and mermaid are
   fine in a spec. Function bodies, algorithms as code and finished tests are not.
4. **A gate is an exit criterion.** If a criterion is not met, stop and say exactly what
   is missing. No "we'll add it later".
5. **The author never reviews their own work.** The result is checked by an independent
   read-only reviewer. The implementer's report is a set of claims you re-check with a
   command, not proof.
6. **Memory lives in the repository.** Progress goes to `plan.md`, review verdicts to
   `review.log.md`. A new session rebuilds the picture from files.
7. **Do not invent requirements.** Anything not in the brief, the reference or the
   conventions goes to "Open questions", not to acceptance criteria.

Before any command, read `AGENTS.md` and `docs/architecture/conventions.md`.

## Tracks (gate G0)

| Situation | Track | Documents |
|---|---|---|
| Clear change, one session, low risk | **small spec** | `spec.md` |
| New feature: data, API, several blocks, parallel work | **full** | `epic.md` + `tasks.md` + `plan.md` |

If the track is not obvious from the request, ask before creating files. A small spec that
has outgrown itself (new API, new data model) stops and becomes a full track with the same
number.

All specs live in `docs/specs/SPEC-NNN-slug/`. The number is the next free one (list
`docs/specs/`), three digits. The slug is `kebab-case`.

## Gate map

| Gate | Exit criterion | Closed by | How |
|---|---|---|---|
| G0 Intake | Track chosen | orchestrator + human | `/sdd small` or `/sdd epic` |
| G1 Spec | Spec `approved`: goal, scope, AC, test scenarios | **human** | edits the status in the file |
| G2 Tasks | Breakdown agreed; every task has AC and scenarios | human | `/sdd tasks` |
| G3 Plan | Waves without path overlap; gates really wired | orchestrator | `/sdd plan` |
| G4 Task | Task DoD: types, lint, tests, hand-off | implementer + orchestrator | `/sdd run` → `npm run validate` |
| G5 Review | Independent reviewer: `APPROVED` | reviewer (read-only) | `/review` → `/sdd fix` |
| G6 Security | No high findings on the change | human + tool | `/security-review`, `npm run audit:deps` |
| G7 Spec close | Every AC confirmed by a test, review log closed | orchestrator | `/sdd close` |
| G8 Build | `validate → audit → build` green | orchestrator / CI | `npm run release:check` |
| G9 Release | Built app opened and checked, release note written | human | `npm run preview` |

A gate whose tool is not present is marked in the plan `aspirational — not wired`, so
nobody relies on it.

## Working with agents

- Implementers are launched as **subagents** of the `react-engineer` custom agent
  (`.github/agents/react-engineer.agent.md`) with the subagent tool. One invocation per
  task. When several tasks are in the same wave, issue all invocations in the same turn
  so they can run side by side where the harness supports it.
- A subagent does not see this conversation. Every prompt you send is self-contained:
  paths, task ID, rules, expected output.
- If subagents are not available in this session, do not substitute a general-purpose
  agent and do not write the code yourself. Print each task prompt in full and tell the
  user to run it in a new chat with the `react-engineer` agent selected, then come back
  and re-run the command.

---

## Commands

### `small <slug>` — create a small spec

1. Determine the next number; create `docs/specs/SPEC-NNN-<slug>/`.
2. Copy `templates/small-spec.md` → `spec.md`.
3. Fill it from the user's brief and the files they referenced. Ask at most three
   clarifying questions, and only if an AC cannot be formulated without the answer.
4. Run the **spec self-check** (below) and show the result.
5. Leave the status `draft`. Tell the human what to check and how to approve: open the
   file and replace `draft` with `approved`.

### `epic <slug>` — create an epic (full track)

Same, with `templates/epic.md` → `epic.md`. Sections with nothing to say are deleted
whole — never leave "N/A".

### Spec self-check

A mechanical pass, not a review. Show the user a "check → result" table:

1. Every functional requirement is covered by at least one AC, and every AC traces back
   to a requirement.
2. Every AC names an **observable** outcome: a third person can say "met" or "not met".
   "Works fast", "looks good" are not AC.
3. Every rule has a negative case (what happens when the condition does not hold).
4. The "Out of scope" section is not empty.
5. No template slots are left: run `node scripts/spec-lint.mjs <file>` and paste its real
   output. Expected: `OK`.

### `tasks SPEC-NNN` — break the epic into tasks (G2)

1. Check that `epic.md` is `approved`. If it is `draft`, **refuse** and explain: slicing
   an unapproved spec is wasted work.
2. Copy `templates/tasks.md` → `tasks.md`.
3. Build the task index and one block per task. Rules:
   - A task is **self-contained**: the implementer does not read neighbouring tasks. Any
     interface a task takes from another is quoted in its "Contracts" section.
   - A task has `Scope paths` — the exact list of paths it may change.
   - Every task AC references an epic AC. Every epic AC is assigned to at least one task
     — show the traceability table.
   - 3–5 primary test scenarios per task, each covering an AC.
   - Size S or M only. An L task is split.
   - No more than six tasks.
4. Show the index and the dependency graph. This is the agreement point: the human
   confirms the breakdown or asks to re-slice.

### `plan SPEC-NNN` — execution plan in waves (G3)

1. Check that `tasks.md` exists.
2. Copy `templates/plan.md` → `plan.md`.
3. Build waves from `Blocked by`: a task joins a wave when all its blockers are in earlier
   waves.
4. **Conflict dry-run.** Compare the `Scope paths` of tasks in the same wave. A shared
   path is a merge conflict: move one task to the next wave or mark the risk explicitly.
   No more than three tasks per wave.
5. Write the graph (mermaid), the critical path and the wave table.
6. **Check that the gates are wired** — promise nothing that is not there:
   - `.github/agents/react-engineer.agent.md` exists;
   - `.github/agents/code-reviewer.agent.md` and `.github/prompts/review.prompt.md`
     exist;
   - `git rev-parse --verify main` succeeds (the reviewer diffs against `main`).
   Mark anything missing in the gate table as `aspirational — not wired` and tell the
   user in a separate line.

### `run SPEC-NNN [--commit]` — execute (G4)

**Pre-flight — if any check fails, stop:**

- The spec (`spec.md` or `epic.md`) is `approved`.
- For the full track, `tasks.md` and `plan.md` exist.
- The `react-engineer` agent exists. If not, say how to create it and stop. Do not
  substitute a general-purpose agent.
- The current branch is `spec/NNN-slug`. If you are on `main`, create the branch with
  `git switch -c spec/NNN-slug` and say so.

**Small spec.** One `react-engineer` subagent. The prompt gives the path to `spec.md`,
tells it to work strictly within the spec's scope and to return a hand-off per
`templates/handoff.md`.

**Full track.** **One** wave per invocation — the first wave with unfinished tasks:

1. Launch the `react-engineer` subagents — one per task, all in the same turn. Each
   prompt is self-contained:
   - the spec directory path and the task ID;
   - "read `epic.md` and your own block in `tasks.md`; do not read neighbouring tasks";
   - "change files only within the Scope paths of your task";
   - "do not edit `plan.md` or `review.log.md`";
   - "create and edit files with the editor tools, not through the terminal";
   - "other agents work in the same directory during this wave: run only the tests of
     your own paths (`npx vitest run <path>`); do not fix a type or lint error in a file
     outside your Scope paths — report it in the hand-off";
   - "return a hand-off per `templates/handoff.md`".
2. From wave 2 on: read `review.log.md` and pass the implementers up to three lines
   about what has already gone wrong. Implementers only — the reviewer never receives
   this digest.
3. When all agents have returned, run `npm run validate` **yourself** and read the
   result of every step. An agent's "all green" does not close the gate.
4. Red gate: return the error to the responsible agent once. Red again — mark the task
   `blocked`, leave the other tasks of the wave alone, report to the user.
5. Update the statuses in `tasks.md` and the progress log in `plan.md`. Only you write
   the log — agents return their line in the hand-off.
6. With `--commit` and a green gate: commit the wave as
   `feat(SPEC-NNN): wave N — T-00X, T-00Y`. Without the flag, do not commit.
7. **Stop.** Report: what was done, the gate result, what to check by hand, and the next
   command (next wave or review).

### `fix SPEC-NNN` — process the reviewer's report (G5)

Input: the `/review` report in this conversation (or pasted by the user).

1. Create `review.log.md` from `templates/review-log.md` if it does not exist.
2. Determine the round number: rounds already recorded + 1. Record the round: the verdict
   verbatim, one line per finding (`F-n`, severity, category, location).
3. Verdict `APPROVED` — nothing to fix. Report that G5 is closed; the next step is
   security.
4. Verdict `CHANGES REQUESTED` in the **second** round — **stop**. The course limit is
   two review rounds. A third loop is a disagreement, not a bug: show the human the open
   findings and propose a decision (accept with a recorded reason, grant one more round,
   send the spec back for rework). Record the human's decision in the log.
5. Otherwise launch a `react-engineer` subagent: the prompt gives the spec path and the
   "Findings for the implementer" block **verbatim**, under the heading "findings from
   earlier review". Requirement: fix every `blocker` and `major`, answer every
   `question`; for `minor`, fix or explain the refusal. You do not touch the code
   yourself.
6. Run `npm run validate` yourself.
7. Append the response to every finding to the log: `fixed` (where), `answered`,
   `disputed` (with evidence).
8. Give the user the ready re-review command:
   `/review re-review: previous findings — docs/specs/SPEC-NNN-slug/review.log.md, round 1; task: docs/specs/SPEC-NNN-slug/<epic.md|spec.md>`

### `close SPEC-NNN` — close the spec (G7 → G8)

1. **AC traceability.** Table: AC → test (file and test name) → status. An AC without a
   test — stop.
2. **Review log.** The last verdict is `APPROVED`, or a human decision is recorded. No
   log means no review happened: stop and say which command runs it.
3. **Security.** `review.log.md` must contain a `## Security` section. If not, ask the
   user for the `/security-review` result and record it. A high finding without a
   resolution — stop.
4. Run `npm run release:check` (validate → audit → build) and read every step.
5. Set the statuses: spec `done`, plan `completed`.
6. Append an entry to `docs/release-notes.md` (create it if missing): date, SPEC ID,
   title, 1–3 lines on what changed for the user.
7. Final report: gate results, a consolidated manual-check list, open questions, and the
   ready `git` commands to merge the branch. Do not merge or push yourself.

### `status` — where are we

A table over every directory in `docs/specs/`: spec, track, status and the state of gates
G1–G9 derived from files (status in Meta, presence of `tasks.md` / `plan.md`, progress
log, last verdict in `review.log.md`, Security section, entry in `release-notes.md`).
Change nothing.

---

## When something goes wrong

- **A task hits a contradiction in the spec.** Do not patch it on the fly. Stop,
  describe the contradiction, propose a spec change. Changing an approved spec is a line
  in its "Change log" and re-approval by a human.
- **An implementer finds a defect outside its task.** It reports it in the hand-off and
  leaves it alone. You raise it to the user as a separate item.
- **A gate cannot run** (no network, tool missing). That is not "passed". Write "could
  not run: reason".

## Skill files

- `templates/small-spec.md` — single-file spec.
- `templates/epic.md` — epic.
- `templates/tasks.md` — index and task block.
- `templates/plan.md` — waves, graph, gates, progress log.
- `templates/handoff.md` — implementer's completion report.
- `templates/review-log.md` — log of review rounds and security.
- `scripts/spec-lint.mjs` (repository root) — checks a document for unfilled template
  slots.

## What is simplified compared with the full version

This is a workshop extract of the full `spec-development` skill. Document formats and
numbering are compatible, but this version has no hotfix track, no brownfield discovery,
no per-spec `verification-checklist.md` (conventions and DoD play that role), no
`BUG-NNN` defect register, no per-task review (here it is one per spec), no `dw` engine
and no compliance mode. The review round limit is two instead of three.
