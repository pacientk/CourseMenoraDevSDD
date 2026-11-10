# Menora · SDD Workshop — "Customer 360"

Training React project: the service-centre page «תמונת לקוח 360» (customer profile).
On it we walk the whole Spec-Driven Development cycle: spec → tasks → plan → implementation
by an agent → independent review → security → build.

Stack: React 19 · TypeScript (strict) · Vite · React Router · Vitest + Testing Library · oxlint.
UI language is Hebrew, RTL. Data comes from the open DummyJSON API (`VITE_API_BASE_URL`).

## Rules

- **Spec-driven development.** No code without a spec in status `approved` under
  `docs/specs/`. Specs, tasks and plans are managed by the `sdd` skill
  (`.github/skills/sdd/`). Only a human sets `approved`.
- **Roles.** The `react-engineer` agent writes code. An independent read-only reviewer
  checks it: `/review` (the `code-reviewer` agent). The author never reviews their own work.
- **Git.** The integration branch is `main`. Work on a spec happens on `spec/NNN-slug`.
  Commit, merge and push only when the user explicitly asks.
- **Dependencies.** Everything needed is installed. A new package is allowed only if an
  approved spec names it.
- **Language.** Answer the user in English. Course documents, code, test names and commit
  messages are in English. UI strings are Hebrew and come only from
  `src/shared/i18n/he.ts`.
- **Tools.** Create and change files with the editor tools (edit / create file), not through
  the terminal (heredocs, `sed -i`, scripts that write files).
- **Shell.** Participants work on Windows (PowerShell) and macOS (zsh). Use only commands
  that work in both: `npm run …`, `npx …`, `node …`, `git …`. No `&&` chains, no `ls`,
  `cat`, `grep`, `rm`, `mktemp`, pipes or redirects — use the editor and search tools
  instead, or the Node scripts in `scripts/`.

## Before writing code

1. Read `docs/architecture/conventions.md` — layers, components, styles, data, security,
   tests.
2. Read the spec and your task in full, including acceptance criteria and test scenarios.
3. Design: `docs/design/README.md`. Look at the PNG. The HTML reference is for searching
   by class or selector only — **never read it whole** (60 KB of markup).

## Commands (gates)

| Gate | Command |
|---|---|
| Types | `npm run typecheck` |
| Lint | `npm run lint` |
| Tests | `npm run test` |
| All three in order | `npm run validate` |
| Dependency audit | `npm run audit:deps` |
| Release check (validate → audit → build) | `npm run release:check` |
| Run | `npm run dev` · offline: `npm run dev:offline` |
| Local "deploy" | `npm run build`, then `npm run preview` |

## Never

- Weaken lint or `tsconfig`, skip or delete tests to get a green result.
- Render or log API response fields outside the allowlist
  (`docs/architecture/conventions.md § Security`). The API returns `password`, `ssn`,
  `bank` — they stop at the mapper.
- Write colours, sizes or user-facing strings as literals in components.
- Change files under `tools/` or `docs/design/`.
