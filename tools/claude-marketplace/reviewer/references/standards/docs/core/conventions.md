# Core Conventions

**Layer:** core — naming, TypeScript style, tests, and git for any TypeScript codebase.
Platform layers add their own conventions (component files, styles, screens) on top.

Read alongside [principles.md](./principles.md) and [rules.md](./rules.md).

---

## Naming

| Kind | Convention | Example |
|---|---|---|
| Variable, function, parameter | `camelCase` | `taskCount`, `fetchTasks` |
| Boolean | prefix from `naming.booleanPrefixes` (default `is` / `has` / `should` / `can` / `did`) | `isLoading`, `hasPermission` |
| Module-level constant | `UPPER_SNAKE_CASE` | `SESSION_TIMEOUT_MS` |
| Constant group (object of related constants) | `PascalCase` or `UPPER_SNAKE_CASE`, consistent per project | `Spacing`, `ROUTES` |
| Type, interface, enum | `PascalCase` noun | `Task`, `ColorTokens`, `SyncState` |
| Props type (component or hook input) | `naming.propsPrefix` + `PascalCase` + `Props` (default prefix `I`) | `ITaskCardProps`, `IUseTaskListProps` |
| Hook result type | `PascalCase` + `Result`, **no** prefix | `UseTaskListResult` |
| Service module | `PascalCase` + `Service` | `StorageService.ts` |
| Test file | mirrors the source file + `.test` | `formatDate.test.ts` |

Units belong in the name when the type does not carry them: `TIMEOUT_MS`,
`maxSizeBytes`, `durationSec`.

### The props prefix, deliberately scoped

The prefix (`I` by default) applies to **props types only** — the input contract of a
component or a hook, recognisable because the name ends in `Props`. Everything else —
domain types, entities, token interfaces, hook result types — stays unprefixed. The
prefix exists to make "this is the public input surface of a UI unit" instantly visible
in an import list; extending it to every interface just adds noise.

A project that prefers no prefix sets `naming.propsPrefix` to `""` on day one. The lint
rule reads the same key, so the document and the enforcement cannot diverge.

### Kebab-case

- Documentation files and directories, spec slugs: `kebab-case`.
- Architecture slice directories (`features/task-create`): `kebab-case` — see
  `docs/architecture/fsd.md`.
- Never in TypeScript source **file** names. Platform layers decide between
  `PascalCase` (components and their folders) and `camelCase` (everything else).

---

## TypeScript

- **`strict: true`**, never overridden. The kit's `tsconfig` adds stricter flags on
  top (`noUncheckedIndexedAccess`, `noImplicitOverride`, …) — see
  `configs/typescript/`.
- **No `any`** — `unknown` plus narrowing, or the concrete exported type.
- **Explicit return types** on everything exported.
- **Named types** — never an inline object type in an exported signature.
- **No type assertions (`as X`)** in production code unless structurally necessary,
  and then with a comment explaining why. `as const` is fine.
- **No non-null assertions (`!`)** — narrow or throw.
- **`Readonly<T>` / `readonly` arrays** on data consumers must not mutate.
- **Discriminated unions over boolean soup.** `{ status: 'loading' } | { status:
  'error'; error: AppError } | { status: 'ready'; data: T }` instead of `isLoading` +
  `error?` + `data?` that can contradict each other.
- **Import the exported type — never redeclare it.** A locally re-declared union drifts
  from its source and the compiler will not tell you.

---

## Tests

Test files are held to the same standard as production code.

- No `any` — mocks satisfy the real exported types.
- No commented-out tests. A dead test is dead code; delete it.
- No unused variables assigned in setup and never read.
- Extract deeply nested callbacks; prefer `for…of` over nested `forEach`.
- **Mock only what you must.** A test that can run against the real implementation
  should.
- Prefer alias-based module mocks (`jest.mock('@entities/task')`) over relative paths —
  they survive moves.
- Global mocks of native or environment modules live in a root `__mocks__/`; per-test
  overrides use a factory.
- Test names state the behaviour, not the implementation: "rejects a title that is only
  whitespace", not "calls validateTitle".
- Every positive case has a paired negative case.

---

## Git

### Branches

```
<integration branch>              # protected; name in PROJECT-PROFILE.md
feature/<ticket-or-slug>
fix/<ticket-or-slug>
chore/<slug>
hotfix/<ticket-or-slug>
```

Never commit directly to the protected integration branch when the profile requires
pull requests. On a solo short-lived project the profile may relax this to short-lived
branches merged locally with `--no-ff`, which still produces a readable history.

### Commits **[Tooling]**

```
{type}({scope}): {description}

feat(tokens): add the light theme token set
fix(TaskCard): derive the disabled colour from the theme
chore(deps): update typescript to 6.0.3
docs(spec-021): mark the design-token epic complete
test(useTaskSync): cover the offline replay path
```

Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `style`, `perf`, `build`,
`ci`, `revert`. Scope: the layer, the module, or the component touched. Enforced by
`configs/commitlint/`.

- One logical change per commit. Do not batch unrelated fixes.
- Describe **what** changed and **why**. The code already explains how.

### Language

- **Conversation** — any language.
- **Everything committed** — English. Code, comments, commit messages, branch names, PR
  titles and bodies, documentation, specs, test descriptions.
