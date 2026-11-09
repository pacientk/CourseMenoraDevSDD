# Stack: React Native

The manifest for React Native projects: which documents apply, in which order, and
which configs back them. Agents and people start here.

Paths are relative to the kit root — `standards/` inside a project that vendors the kit.

## Documents — read in this order

Later layers add to earlier ones and never contradict them. If two documents seem to
conflict, the earlier (more general) one states the principle and the later one its
platform implementation; report the conflict rather than picking one.

| # | Layer | Documents |
|---|---|---|
| 0 | Project profile | `docs/PROJECT-PROFILE.md` and `standards.config.json` in the **project** — every key the documents name resolves here |
| 1 | Core | `docs/core/principles.md`, `docs/core/conventions.md`, `docs/core/rules.md` |
| 2 | Architecture | `docs/architecture/fsd.md` |
| 3 | React | `docs/react/conventions.md`, `docs/react/rules.md` |
| 4 | React Native | `docs/react-native/conventions.md`, `docs/react-native/rules.md` |

## Configs

| Tool | Kit file | Project file |
|---|---|---|
| ESLint | `configs/eslint/presets/react-native.mjs` | `eslint.config.mjs` ← `templates/eslint.config.mjs` |
| TypeScript | `configs/typescript/tsconfig.strict.json` | `tsconfig.json` ← `templates/tsconfig.react-native.json` |
| Aliases | `configs/aliases/aliases.cjs` | `babel.config.js`, `jest.config.js` ← `templates/` |
| Prettier | `configs/prettier/prettier.config.mjs` | `prettier.config.mjs` ← `templates/` |
| commitlint | `configs/commitlint/commitlint.config.mjs` | `commitlint.config.mjs` ← `templates/` |
| lint-staged | `configs/lint-staged/lint-staged.config.mjs` | `lint-staged.config.mjs` ← `templates/` |

## Agents

| Agent | Kit file | Install to | Role |
|---|---|---|---|
| `rn-engineer` | `agents/rn-engineer.md` | `.claude/agents/rn-engineer.md` | Implements a task |
| `code-reviewer` | plugin `reviewer` (`../claude-marketplace/reviewer/`) | `/plugin install reviewer@eng-standards` — once per machine | Verifies it — any project, read-only |

### Implementation loop

1. `rn-engineer` implements the task and hands off.
2. `code-reviewer` (`/reviewer:review`, or the `reviewer:code-reviewer` agent) reviews,
   with the task or spec and the hand-off in its prompt.
3. On `CHANGES REQUESTED`, the reviewer's "Findings for the implementer" block goes into
   the engineer's prompt as **findings from earlier review**; the engineer fixes them and
   hands off again, answering each finding ID.
4. The reviewer re-reviews in re-review mode with the previous findings.
5. After **3 rounds** without `APPROVED`, stop and escalate to a human with both agents'
   last reports — a loop that has not converged by then is a disagreement, not a bug.

## Checklists to run after a task

The checklists at the end of each document, in the order above:
`core/principles.md` → `architecture/fsd.md` → `react/rules.md` → `react-native/rules.md`.
