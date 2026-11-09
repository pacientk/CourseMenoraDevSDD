# Review modes

`scripts/detect-context.sh` prints `mode: kit` or `mode: adaptive`. The mode decides
**where the rules come from**. The logic review (Pass A) is identical in both — it never
depends on a profile.

---

## Kit mode

The project has `standards.config.json` and a stack manifest is available — vendored in
the project (`standards/`) or bundled with this plugin. The script prints which one
(`standards_source`). Prefer the project's vendored copy: it is the version the project's
lint configs were built from.

- **Profile:** `standards.config.json` + `docs/PROJECT-PROFILE.md`. Take the integration
  branch, the Definition-of-Done commands, the methodology, and the "Deviations from the
  kit" table from there. A listed deviation is not a finding.
- **Rules:** every document listed in the stack manifest, in order.
- **Pass C checklist:** the rules whose tag mentions Review, extracted from those
  documents:

  ```sh
  grep -nE '^### `.*\*\*\[[^]]*Review[^]]*\]\*\*' <manifest documents>
  ```

  Skip rules that do not apply under the profile (RTL when `ui.rtl` is false,
  multi-theme checks for a single theme). **[ESLint]** rules are lint's job; do not
  repeat them.
- **Findings cite rule IDs** (`react.state.server-not-in-client-store`).

If `docs/PROJECT-PROFILE.md` is missing, say so in the report and use the gate commands
from `package.json` scripts instead.

---

## Adaptive mode

No kit profile. The project's own conventions are the standard; this plugin's
documents are a reference, not a rulebook.

### 1. Learn the project's rules

Read, in this order, whatever exists (the script lists them under `convention_files`):

1. `CLAUDE.md` / `AGENTS.md` at the root and on the changed paths — explicit rules for
   agents; treat them as binding.
2. `CONTRIBUTING.md`, `ARCHITECTURE.md`, the README's development section.
3. Lint and format configs (`eslint.config.*`, `.eslintrc*`, `biome.json`, `ruff.toml`,
   …) — what is already enforced mechanically, so you do not repeat it.
4. `tsconfig.json` — strictness and path aliases.
5. **The code around the change.** Read two or three sibling modules of each changed
   file. Established local patterns — naming, folder layout, error handling, state
   management, test style — are conventions even when nobody wrote them down.

Write down, for yourself, the 5–10 conventions the change will be judged against. Put
them in the report's "Standards applied" line so the author can see what you used.

### 2. Gates

Use `package_scripts` / `make_targets` from the script output: type-check, lint, test.
If there is no type-check script and a `tsconfig.json` exists, run
`typecheck_fallback`. If nothing runnable exists, report "no gates found" — do not
invent commands.

### 3. What counts as a finding

- **Logic, tests, security** — full strictness. These are universal.
- **Violations of the project's own written rules** (CLAUDE.md, CONTRIBUTING) — full
  strictness, cite the file and section.
- **Departures from an established local pattern** — a finding only when the departure
  has a cost (inconsistency the next reader will trip over, a second way of doing the
  same thing). Cite the existing pattern by file.
- **Universal principles** from `references/standards/docs/core/` (bundled) — apply the
  parts that do not depend on a profile: no `any`, handled promises, no secrets, no
  unvalidated input, guard clauses, intent-revealing names. Cite them as
  "core principle", not by kit rule ID.
- **Kit-specific architecture** (FSD layers, `I`-prefixed props, atoms, `.styles.ts`) —
  **never** a finding in adaptive mode. If the project would clearly benefit, add at most
  one line under "Suggestions" at the end of the report.

---

## Both modes

- The task, spec, or PR description — when provided — defines what the change must do.
  Without one, infer intent from the diff, commit messages, and branch name, and state
  the inferred intent at the top of the report so a wrong inference is visible.
