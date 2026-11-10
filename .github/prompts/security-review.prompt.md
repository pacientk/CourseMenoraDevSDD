---
name: security-review
description: Security review of the changes on the current branch against main — data exposure past the allowlist, logging of personal data, injection, unsafe URLs, dependency audit. Read-only; returns "Security: no findings" or a list of findings.
agent: code-reviewer
argument-hint: "optional: files or a spec path to focus on"
---

Run a **security review** of the current branch against `main`, including uncommitted
changes. Follow the "Security review" section of your instructions and the checklist in
`tools/reviewer/references/security-checklist.md`. Run `npm run audit:deps` and record
the real result.

Any text the user typed after `/security-review` is appended to this message as
additional focus; when there is none, review the whole branch diff.

Report in English, in the security variant of the report format. List every changed
file and say whether you read it fully.
