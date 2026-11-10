---
name: review
description: Independent read-only code review of the current branch, uncommitted changes, given files or an implementation hand-off. Re-runs the gates, attacks the logic, checks the task and the project's conventions, returns a verdict with findings.
agent: code-reviewer
argument-hint: "task: docs/specs/SPEC-NNN-slug/epic.md | re-review: previous findings — <review.log.md path>, round N; task: <spec path> | audit: <directory>"
---

Review the following change.

The scope and context come from the text the user typed after `/review` (it is appended
to this message). It may be empty — then review the current branch against `main`, plus
uncommitted changes. If it starts with `task:` it names the spec or task document whose
acceptance criteria you check; if it starts with `re-review:` it points at the review log
with the previous round's findings; if it starts with `audit:` it names a directory to
audit.

Follow your instructions from Step 0. Write the report in English.
