# Core Rules

**Layer:** core — enforceable rules for any TypeScript codebase. Each rule has a stable
**ID**, an **enforcement tag**, and a reason. The ID also appears as a comment next to
the lint rule that implements it in `configs/eslint/`.

Read alongside [principles.md](./principles.md) and [conventions.md](./conventions.md).
Values such as limits and prefixes come from the profile (`standards.config.json`); the
key is named, never the value.

---

## Naming

### `core.naming.boolean-prefix` — booleans carry a prefix **[ESLint]**

```ts
// Wrong
const passes = score > threshold;
const loading = true;

// Right
const isPassing = score > threshold;
const isLoading = true;
const hasPermission = roles.includes('admin');
const shouldRedirect = !isAuthenticated;
const canSubmit = isFormValid && !isSubmitting;
const didFetch = response !== null;
```

Applies to variables, parameters, and properties declared in your own types. Prefixes
come from `naming.booleanPrefixes`. It reads better, and a boolean that is accidentally
a string or a number stands out immediately.

Properties inherited from a third-party type (`disabled` on a platform component) keep
their original name — the rule checks declarations, not usages.

### `core.naming.props-prefix` — props types are prefixed **[ESLint]**

Every interface or type alias whose name ends in `Props` starts with
`naming.propsPrefix`. See [conventions.md § The props prefix](./conventions.md#the-props-prefix-deliberately-scoped).

### `core.naming.type-case` — types are `PascalCase` **[ESLint]**

Interfaces, type aliases, enums, and type parameters are `PascalCase`.

---

## Imports

### `core.imports.no-deep-relative` — aliases, never deep relative traversal **[ESLint]**

```ts
// Wrong
import type { Task } from '../../entities/task/model/Task';

// Right
import type { Task } from '@entities/task';
```

Imports that climb two or more levels (`../../`) are blocked. Same-directory and
one-level relatives are fine. Test files are exempt. Aliases are declared once, in the
project `tsconfig.json`; every other tool derives them from there
(`configs/aliases/`).

### `core.imports.type-only` — `import type` for type-only imports **[ESLint]**

Auto-fixable. Removes a runtime import that exists only for a type.

### `core.imports.sorted` — import order is automatic **[ESLint]**

Handled by the sorter; never argued about in review.

### `core.imports.banned` — the per-project ban list **[ESLint]**

Some modules must only be reached through a project seam (a wrapper service, a typed
hook). Each platform layer declares its ban entries with the reason and the path where
the import *is* allowed. They are all compiled into one `no-restricted-imports` rule by
`configs/eslint/lib/restricted-imports.mjs`, so layers never overwrite each other's
entries.

---

## Constants and Types

### `core.const.no-magic-numbers` — name your numbers **[ESLint: warn]**

```ts
// Wrong
const timeout = setTimeout(fn, 3000);

// Right
const SESSION_TIMEOUT_MS = 3_000;
const timeout = setTimeout(fn, SESSION_TIMEOUT_MS);
```

A short ignore list covers self-evident values (`-1`, `0`, `1`, `2`, `100`). Object
literal values are checked too — that is what catches `{ marginTop: 16 }`. Directories
that *define* raw scales (design-token primitives) are exempt; the paths come from the
profile.

### `core.const.single-home` — shared constants live in one place **[Review]**

The same literal defined in two modules is a bug waiting for one of them to change.
Constants used by more than one slice go to the shared layer's constants module.

### `core.types.use-exported` — use the exported type, never redefine it **[Review]**

A locally re-declared union drifts from its source and the compiler will not tell you.

---

## TypeScript

### `core.ts.strict` — strict compiler settings **[TS]**

`strict: true` plus the extra flags in `configs/typescript/tsconfig.strict.json`.
Never relaxed per file.

### `core.ts.no-any` — no `any` **[ESLint: error]**

Use `unknown` plus a type guard, or the actual exported type. The type-aware
`no-unsafe-*` rules catch `any` that leaks in from untyped dependencies.

### `core.ts.explicit-boundary-types` — explicit types on exports **[ESLint]**

Exported functions and hooks declare their return type. Inference is fine inside a
module; at a boundary, the signature is the contract and should not change because an
implementation detail did.

### `core.ts.no-non-null` — no non-null assertions **[ESLint: error]**

```ts
// Wrong
const user = getUser()!;

// Right
const user = getUser();
if (!user) throw new Error('User not found');
```

### `core.ts.no-floating-promises` — every promise is handled **[ESLint: error]**

```ts
void doSomethingAsync();               // fire-and-forget, explicitly acknowledged
await doSomethingAsync();              // awaited
doSomethingAsync().catch(handleError); // handled
```

An unhandled rejection in a UI runtime does not crash loudly — it disappears. This rule
is how you find out that a mutation silently failed. `void` is an acknowledgement, not
a licence: a voided call still needs its own error handling inside.

### `core.ts.assertions` — no unchecked assertions **[ESLint + Review]**

Object-literal assertions (`{} as Task`) are blocked by lint. Any other `as X` in
production code needs a comment explaining why the compiler cannot know.

---

## Structure

### `core.struct.max-depth` — nesting depth limit **[ESLint: error]**

Block nesting is capped at `limits.maxDepth`. Flatten with guard clauses and extracted
functions.

### `core.struct.file-size` — file length limit **[ESLint]**

Source files are capped at `limits.fileLines`, blank lines and comments excluded. Tests
and stories are exempt. Platform layers may set a tighter limit for UI files.

---

## Lint hygiene

### `core.lint.disable-with-reason` — every disable states why **[ESLint: error]**

```ts
// Wrong
// eslint-disable-next-line @typescript-eslint/no-explicit-any

// Right
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- third-party API returns an untyped shape; tracked in TICKET-123
```

This is the kit's single exception mechanism: when a rule's rationale does not hold,
disable it locally *with the reason*. A reviewer reads the reason, not the code, to
decide whether the exception stands.

### `core.lint.disable-hygiene` — no stale or unpaired disables **[ESLint: error]**

A block `eslint-disable` needs a matching `eslint-enable`. A disable that no longer
suppresses anything is reported as an error, so exceptions do not outlive their cause.

---

## Security

### `core.sec.no-eval` — no dynamic code evaluation **[ESLint: error]**

No `eval`, no `new Function`, no string-argument `setTimeout`.

### `core.sec.no-dynamic-regexp` — no `RegExp` from non-literals **[ESLint: error]**

A user-supplied pattern is a denial-of-service vector. Escape input or use a literal.

### `core.sec.object-injection` — dynamic keys are reviewed **[ESLint: warn]**

Object access by a non-literal key is flagged as a warning and always looked at in
review. It is noisy by design; a justified case carries a disable with a reason.

### `core.sec.no-secrets` — no secrets in the repository **[Review]**

Configuration comes from the environment and is validated at startup. Anything shipped
inside a client bundle is public — a "secret" in client code is not a secret.

### `core.sec.no-pii-in-logs` — no user data in logs **[Review]**

### `core.sec.validated-urls` — external URLs go through a validating seam **[Review]**

Platform layers name the API and ban the raw one.

---

## Formatting and gates

### `core.fmt.prettier` — Prettier is the only formatter **[Tooling]**

ESLint never formats; `eslint-config-prettier` is applied last so the two never fight.

### `core.ci.gates` — gate order **[Tooling]**

Pre-commit: Prettier and ESLint on staged files, commitlint on the message.
CI, in order: **type-check → lint → test**. A type error makes every later failure
noise, so it runs first.
