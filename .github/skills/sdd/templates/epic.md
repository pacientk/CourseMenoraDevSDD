# SPEC-{NNN} — {Title}

> Sections with nothing to say are deleted whole. Section numbers are for references;
> do not renumber after deleting.

## 1. Meta

| Field | Value |
|---|---|
| ID | SPEC-{NNN} |
| Title | {short title} |
| Track | full (epic + tasks + plan) |
| Status | draft |
| Version | 1 |
| Created | YYYY-MM-DD |
| Owner | {name} |

Status: `draft` → `approved` → `in-progress` → `done`. A human moves it to `approved`.
An epic in status `draft` is not broken into tasks.

## 2. Summary

{One paragraph: what we build and why.}

## 3. Goal

{A verifiable outcome for the user or the business. One or two sentences.}

## 4. Users and scenarios

Concrete roles and concrete situations — not "the user" and not "some data".

- **US-1** — As a {role}, I want {action}, so that {benefit}.
- **US-2** — {…}

## 5. Functional requirements

- **FR-1** — {what the system does}
- **FR-2** — {…}

## 6. UX and design

{Reference links: which block of the screenshot, which classes in the HTML reference.
States: loading, empty, error, not found. UI strings as a table.}

| Purpose | Text |
|---|---|
| {…} | {…} |

## 7. Data and contracts

### External API

```
{METHOD /path}
  Success:  {code} → {response shape — only the fields we need}
  Errors:   {code} — {meaning}
```

### Application model

```ts
{model interfaces — what leaves the data layer}
```

### Mapping

| Model field | Source in API response | Rule |
|---|---|---|
| {…} | {…} | {…} |

**Response fields that must not leave the data layer:** {list}.

## 8. Architecture

{Which layers and slices are touched, what lives where. A diagram if useful.}

```mermaid
flowchart LR
    {…}
```

## 9. Non-functional requirements

- **Accessibility:** {…}
- **RTL and layout:** {…}
- **Security:** {…}
- **Reliability:** {request cancellation, races, behaviour on error}

## 10. Acceptance criteria

Observable conditions. Each traces back to a requirement in §5 or §9.

- **AC-1** — {Given … when … then …} *(FR-1)*
- **AC-2** — {…}

## 11. Testing

{Test levels, what is stubbed, which fixtures. Per-task scenarios live in `tasks.md`.}

## 12. Out of scope

- {… — this section cannot be empty}

## 13. Open questions

- {… or "none"}

## 14. Risks and assumptions

| Risk / assumption | What we do |
|---|---|
| {…} | {…} |

## 15. Change log

A line is added for every change after approval. Changing an approved epic requires
re-approval by a human.

| Date | Version | What changed | Tasks affected | Approved by |
|---|---|---|---|---|
| | | | | |
