---
name: review
description: Independent code review of the current branch, uncommitted changes, given files, or an implementation hand-off — re-runs the gates, attacks the logic, checks the task and the project's standards, returns a verdict with findings. Runs in an isolated read-only reviewer context.
context: fork
agent: reviewer:code-reviewer
disable-model-invocation: true
---

Review the following change.

Scope and context from the user (may be empty — then review the current branch against
the integration branch, plus uncommitted changes):

$ARGUMENTS

Follow your instructions from Step 0. Answer in the language of the request above; if it
is empty, use the language of the project's commit messages.
