# Menora · SDD Workshop

Starter repository for the workshop "Spec-Driven Development in practice". In one meeting
we walk the full development cycle of the page «תמונת לקוח 360» (Customer 360) — from spec
to built application — with agents and gates at every stage, using GitHub Copilot in
VS Code.

## Before the meeting (10 minutes)

You need **Node.js 22.12+**, **Git**, **VS Code** with the **GitHub Copilot** and
**GitHub Copilot Chat** extensions, signed in to GitHub. Windows and macOS both work.

```sh
git clone https://github.com/pacientk/CourseMenoraDevSDD.git
cd CourseMenoraDevSDD
npm install
npm run doctor
```

`npm run doctor` checks the machine and says what to fix. An `[INFO]` line about the
`react-engineer` agent is expected: we create it during the meeting.

## During the meeting

Open `workshop/prompts.html` in a browser — every command and prompt, step by step, with
a fallback for each step and a Windows / macOS switch.

## What is where

```
AGENTS.md                       project rules for agents and people
.github/
  copilot-instructions.md       points Copilot at AGENTS.md
  skills/sdd/                   the Spec-Driven Development skill and document templates
  agents/code-reviewer.agent.md independent read-only reviewer
  agents/                       the react-engineer agent is created here during the meeting
  prompts/                      /review and /security-review
.vscode/settings.json           pre-approved terminal commands for Copilot agent mode
docs/
  architecture/conventions.md   conventions: layers, components, data, security, tests
  design/                       screenshot and markup of the target page
  specs/SPEC-001-app-shell/     the first spec — already written and approved
tools/reviewer/                 reviewer references and scripts (context, hotspots)
workshop/
  prompts.html                  all prompts of the meeting
  START.html                    guide for a test participant (dry run)
  briefs/                       product briefs for SPEC-002 and SPEC-003
  reference/                    the agent pattern we create our own agent from
  fallback/                     ready-made agent in case something goes wrong
  golden/                       reference documents for SPEC-002
scripts/                        doctor, catchup, spec-lint
src/                            the app: app · pages · widgets · entities · shared
mocks/                          offline copy of the API
```

## Commands

| What | Command |
|---|---|
| Run | `npm run dev` |
| Run without access to the API | `npm run dev:offline` |
| All gates: types → lint → tests | `npm run validate` |
| Release check: validate → audit → build | `npm run release:check` |
| Build and open as on the server | `npm run build`, then `npm run preview` |
| Check the machine | `npm run doctor` |
| Catch up with the group from a checkpoint | `npm run catchup` |
| Check a spec for unfilled template slots | `npm run spec:lint -- <file>` |

## After the meeting

- Self-study assignment: `workshop/briefs/SPEC-003-customer-search.md`.
- The `sdd` skill is a workshop extract. What is simplified compared with the full
  version is listed at the end of `.github/skills/sdd/SKILL.md`.
