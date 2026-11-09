# Core Principles

**Layer:** core — applies to every TypeScript codebase that adopts this kit, whatever the
platform. Platform layers (`docs/react/`, `docs/react-native/`, …) add to these
principles; they never contradict them.

Read alongside [conventions.md](./conventions.md) (naming, TypeScript, tests, git) and
[rules.md](./rules.md) (enforceable rules). Project-specific values resolve against the
project profile — see [§ The profile](#the-profile).

---

## KISS — Keep It Simple

Write the simplest solution that correctly solves the problem. Complexity is a
liability, not a feature.

- One function = one clear purpose. If the name needs "and", split it.
- Prefer ten lines of readable code over three lines of clever code.
- No speculative abstractions. Solve what is in front of you.
- If a simpler approach produces the same result, use it.

## DRY — Don't Repeat Yourself

Every piece of knowledge has a single authoritative representation.

- Two occurrences of the same logic is a warning; three is a rule — extract it.
- Shared logic goes to the lowest layer that every consumer can reach (see the
  architecture document of your stack).
- Configuration values live in one place. A value repeated in two files is two values
  that will eventually disagree — this applies to these standards too: numeric limits
  live in the profile, never restated in a rule document.
- **DRY applies to knowledge, not to shape.** Two pieces of code that happen to look
  alike today are not duplication. Merging them behind a `variant` flag is usually a
  mistake that costs more than the repetition saved.

## YAGNI — You Aren't Gonna Need It

Do not implement anything that is not required right now.

- No "just in case" parameters, flags, or config options.
- No generic infrastructure built for a single use case.
- No backwards-compatibility shims until a consumer exists.
- No capabilities the profile declares out of scope.
- Requirements change. Code written for an imagined future is usually wrong and always
  costs maintenance.

**Where YAGNI does not apply.** A handful of decisions are *structural*: cheap to make
now, expensive to retrofit once the codebase has consumers. The layer boundary, the
public API of each module, and type strictness are always in this set; platform layers
name their own (list virtualisation, the design-token layer, the animation thread).
YAGNI governs features and abstractions, not the shape of the foundation.

## SOLID

### S — Single Responsibility

One module, function, or component does one job.

- Business logic lives in dedicated functions or hooks, not in presentation code.
- Complex derived state becomes a named variable, not an expression buried in markup.
- A provider resolves and provides. It does not also observe the OS, persist
  preferences, and fire analytics.

### O — Open/Closed

Extend by composition, not by modification.

- Shared primitives accept overrides but define their defaults centrally. Never edit a
  primitive to accommodate one caller — wrap it.

### L — Liskov Substitution

A subtype must be usable wherever its base type is, without surprising the caller.

- Do not weaken a contract in a wrapper (making a required argument optional while the
  caller still relies on it being present, or throwing where the base returned).

### I — Interface Segregation

No consumer should be forced to depend on members it does not use.

- Prefer several small, role-specific interfaces over one wide one. A component that
  only displays a task's title takes `title: string`, not the whole `Task`.
- Do not pass a service object into a function that calls one method on it — pass the
  method, or a narrow interface.
- A hook returns what its callers need, not everything it happens to compute.

### D — Dependency Inversion

Depend on abstractions, not on concrete implementations.

- Feature code reaches the network through typed service functions, never by
  constructing an HTTP call inline.
- Global state is consumed through typed accessors (hooks, selectors), never by
  importing the store singleton.
- Platform layers add their own instances (theme through a hook, not an imported
  theme object).

---

## Occam's Razor

Among competing solutions, prefer the one with the fewest assumptions.

- Before adding an abstraction, ask whether it reduces complexity or merely relocates it.
- Prefer platform built-ins and existing project utilities over a custom implementation.
- A new file, module, or dependency must earn its place. The default answer is: reuse
  what already exists.

---

## Decomposition

- **Size limits are hard limits.** The per-file line limit and the nesting depth come
  from the profile (`limits.*`). Over the limit means mandatory extraction — extract
  before you reach it, not after.
- **Guard clauses over nesting.** Return early; the happy path reads top to bottom.
- **Name intermediate results.** A derived value with a name is documentation; an inline
  expression is a puzzle.
- **One concept per module.** If you cannot name a module without "and" or "utils",
  it is two modules.

---

## Rules carry their cost

Every rule in this kit states *why* it exists. A rule with no rationale gets
cargo-culted, then applied where it hurts. When a rule's rationale does not hold in a
specific case, the right move is a documented exception (rule
`core.lint.disable-with-reason` in [rules.md](./rules.md)), not a silent violation and
not a silent rewrite of the rule.

Rules are referenced by **ID** (`core.ts.no-any`, `rn.ui.atoms-only`), never by heading
anchor. IDs are stable across edits; the same ID appears as a comment next to the lint
rule that enforces it in `configs/`, so `grep` gets you from the rule to its mechanism
and back.

## Enforced beats documented

Every rule is tagged with how it is enforced:

| Tag | Meaning |
|---|---|
| **[ESLint]** | CI-blocking lint rule, wired in `configs/eslint/` |
| **[TS]** | Enforced by the type system or `tsconfig` |
| **[Tooling]** | Enforced by another tool (Prettier, commitlint, a git hook) |
| **[Review]** | Enforced by humans and agents. Nobody should assume CI catches it |

A rule tagged **[Review]** that is violated often is a candidate for automation.

## The profile

The kit separates *what we believe* (these documents) from *what this project chose*
(the profile). A project has two profile files:

- `PROJECT-PROFILE.md` — the human-readable decisions: stack, product constraints,
  process. Template: `profile/PROJECT-PROFILE.template.md`.
- `standards.config.json` — the machine-readable values the configs consume: limits,
  layer order, paths, toggles. Template: `profile/standards.config.template.json`.

A rule document never restates a profile value. It names the key
(`limits.componentFileLines`) and, at most, its default.

---

## Universal Quality Checklist

Run over every file changed in the current task. Platform layers append their own
sections.

- [ ] No `any` — `unknown` plus narrowing, or the real exported type
- [ ] Explicit return types on everything exported
- [ ] Named types — no inline object types in exported signatures
- [ ] Guard clauses instead of nested conditionals; within the depth limit
- [ ] No dead code — no commented-out blocks, no unused imports or variables
- [ ] Intent-revealing names — no `tmp`, `data2`, `val`, `res`
- [ ] No magic numbers — named constants
- [ ] Every promise awaited, returned, or explicitly voided with handling
- [ ] Every `eslint-disable` carries a reason
- [ ] Type-check exits 0; lint reports 0 errors and no new warnings
- [ ] Tests green, with new tests covering every acceptance criterion — negative cases
      paired with positive ones
