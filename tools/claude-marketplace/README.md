# Claude marketplace

A Claude Code marketplace (`eng-standards`) with plugins built on the engineering
standards kit, which lives next to it in `../rn-standards/`.

| Plugin | What it gives you |
|---|---|
| `reviewer` | `/reviewer:review`, `/reviewer:audit`, and the `reviewer:code-reviewer` agent — an independent, read-only code reviewer for **any** project |

## Install (once per machine)

In any Claude Code session:

```
/plugin marketplace add "<path-to>/claude-marketplace"
/plugin install reviewer@eng-standards
```

Restart the session. The reviewer is now available in every project — nothing is
copied into projects.

To try it without installing: `claude --plugin-dir "<path-to>/claude-marketplace/reviewer"`.

## Use

```
/reviewer:review                                  # current branch vs integration branch + uncommitted
/reviewer:review src/features/auth                # a directory or files
/reviewer:review задача: <text or spec path>      # check against a task / acceptance criteria
/reviewer:review re-review: <previous findings>   # second round
/reviewer:audit                                   # whole project: parallel, risk-first
/reviewer:audit src/features                      # a large directory
```

**Review vs audit.** `/reviewer:review` is one reviewer: a change (branch, diff) or a
small scope, read in full. Given a directory it audits risk-first — it ranks files with
`scripts/hotspots.sh`, reads the riskiest fully, and probes stateful code with throwaway
tests run from a temp directory. `/reviewer:audit` runs in your session as an
orchestrator: it ranks modules, runs the gates once, launches up to 6 reviewers in
parallel (one per high-risk module), and merges their reports.

Every report has a **Coverage** section — what was read fully, partially, not opened,
probed, and which high-risk modules lay outside the scope. An `APPROVED` covers only
what Coverage lists.

Or in plain words — "review my branch with the code reviewer" — and Claude delegates to
the `reviewer:code-reviewer` agent.

The review runs in an isolated context with no write tools. It re-runs the project's
gates, attacks the logic, checks the task and the standards, and returns a verdict
(`APPROVED` / `CHANGES REQUESTED`) with findings `F-1…` and a block ready to paste into
an implementing agent.

## Two modes, chosen automatically

| Project has | Mode | Standards applied |
|---|---|---|
| nothing special | **adaptive** | The project's own `CLAUDE.md`, contributing docs, lint configs, and established local patterns; universal core principles. Kit-specific architecture is never imposed. |
| `standards.config.json` | **kit** | The full kit for the profile's stack — from the project's vendored `standards/` if present, otherwise the copy bundled in the plugin. |

Logic, tests, and security are reviewed with full strictness in both modes.

Gates come from the profile (kit mode) or from `package.json` scripts / `Makefile`
targets (adaptive mode). The reviewer keeps per-project memory (recurring findings,
gate quirks) in `.claude/agent-memory/reviewer-code-reviewer/` — add it to the
project's `.gitignore` or commit it, as you prefer.

## Layout

```
claude-marketplace/
├── .claude-plugin/marketplace.json
├── scripts/sync-standards.sh          # copies kit docs/ + stacks/ into the plugin
└── reviewer/
    ├── .claude-plugin/plugin.json
    ├── agents/code-reviewer.md        # the reviewer: process, constraints (read-only)
    ├── skills/review/SKILL.md         # /reviewer:review — forks into the agent
    ├── skills/audit/SKILL.md          # /reviewer:audit — orchestrates parallel reviewers
    ├── scripts/detect-context.sh      # mode, gates, branches, scope — deterministic
    ├── scripts/hotspots.sh            # risk ranking of files / modules — deterministic
    └── references/
        ├── modes.md                   # where the rules come from in each mode
        ├── logic-checklist.md         # Pass A attack list, incl. stateful seams
        ├── report-format.md           # the report contract
        └── standards/                 # GENERATED copy of the kit — do not edit
```

## Maintaining

- Kit documents are the source of truth. After changing `rn-standards/docs/` or
  `rn-standards/stacks/`, run `claude-marketplace/scripts/sync-standards.sh`; `--check` exits 1 when the copy is stale (use it
  in CI or a pre-commit hook).
- Bump `version` in `reviewer/.claude-plugin/plugin.json` on every change you want
  installed copies to pick up, then `/plugin update reviewer@eng-standards`.
- Validate before publishing: `claude plugin validate claude-marketplace/reviewer` and
  `claude plugin validate claude-marketplace`.
