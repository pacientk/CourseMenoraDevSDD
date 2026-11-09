---
name: audit
description: Parallel risk-first audit of a whole project or a large directory — ranks modules by risk, runs the gates once, launches several read-only reviewer agents in parallel (one per high-risk module), and merges their reports into one verdict with a coverage map. Use for "audit the project", not for reviewing a branch or a diff.
disable-model-invocation: true
---

# Parallel audit

You orchestrate; the `reviewer:code-reviewer` agents review. You do not review code
yourself and you never modify the project.

Scope and context from the user (empty → the whole repository):

$ARGUMENTS

Answer in the language of the request; if it is empty, in the language of the project's
commit messages.

## 1. Map the risk

From the project root run:

```sh
bash "${CLAUDE_PLUGIN_ROOT}/scripts/detect-context.sh"
bash "${CLAUDE_PLUGIN_ROOT}/scripts/hotspots.sh" <scope> --modules --top 25
```

Pick the module depth that matches the codebase: the default (`src/<layer>/<slice>`)
fits feature-sliced code; use `--depth 2` for a flat `src/<module>` layout.

## 2. Plan the units

Turn modules into **review units**, at most **6**:

- The highest-scoring modules each get their own unit. A very large module (roughly 60+
  source files) may be split by segment (`model/`, `ui/`, `api/`).
- Small low-score modules are bundled into one "remainder" unit, or listed as **not
  reviewed** if the budget is spent. Never drop them silently.
- Shared infrastructure the top modules depend on (HTTP client, storage, stores) goes
  with the module that uses it most, or in its own unit if it scores high.

Show the plan to the user as a table — unit, modules, score, files — before launching.

## 3. Run the gates once

Run type-check, lint, and the full test suite yourself, with the commands from
`detect-context.sh` (profile in kit mode, package scripts in adaptive mode), and keep
the real results. Parallel reviewers must not each run the full suites.

## 4. Launch the reviewers in parallel

In **one** message, launch one `reviewer:code-reviewer` agent per unit. Each prompt
contains:

- `Audit of <unit paths>.` — the exact scope.
- The audit's intent from `$ARGUMENTS`, if any.
- `Gates were already run by the orchestrator:` followed by the gate table — so the
  agent runs only tests targeting its scope.
- The hotspot rows for its files, so it starts with the riskiest ones.
- `Report in <language>. Number findings <U>-F-1, <U>-F-2, … where <U> is the unit
  letter (A, B, …).` — to keep IDs unique across units.

## 5. Merge

When every agent has returned, write one report in the format of
`${CLAUDE_PLUGIN_ROOT}/references/report-format.md`, with these differences:

- **Verdict:** `CHANGES REQUESTED` if any unit has a blocker or major.
- **Scope** lists the units; **Gates** is your own table from step 3.
- **Units** — a table: unit, scope, verdict, blockers / majors / minors / questions.
- **Coverage** is the union of the units' coverage, plus the modules nobody reviewed
  with their score. This line is mandatory: it is where the audit stops.
- **Findings** keep each unit's IDs (`A-F-1`), ordered by severity across units. Merge
  duplicates that two units found from different sides into one finding citing both.
- **Findings for the implementer** covers all units, so it can be handed to an
  implementing agent as is.

Do not re-verify or soften the reviewers' findings, and do not add findings of your
own. If a unit failed or ran out of budget, say so and list its scope as not reviewed.
