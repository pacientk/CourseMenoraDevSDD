#!/usr/bin/env node
// Readiness check for the workshop: `npm run doctor`.
// Works on Windows, macOS and Linux. Changes nothing.

import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const MIN_NODE = [22, 12]
const API_URL = 'https://dummyjson.com/users/1'
const API_TIMEOUT_MS = 8000
const COPILOT_EXTENSIONS = ['github.copilot', 'github.copilot-chat']

const results = []

function record(level, name, detail, hint) {
  results.push({ level, name, detail, hint })
}

function run(command) {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8', shell: true }).trim()
  } catch {
    return null
  }
}

function checkNode() {
  const [major = 0, minor = 0] = process.versions.node.split('.').map(Number)
  const isOk = major > MIN_NODE[0] || (major === MIN_NODE[0] && minor >= MIN_NODE[1])
  record(
    isOk ? 'ok' : 'fail',
    'Node.js',
    `v${process.versions.node}`,
    isOk ? null : `Node ${MIN_NODE.join('.')} or newer is required: https://nodejs.org`,
  )
}

function checkGit() {
  const version = run('git --version')
  if (!version) {
    record('fail', 'Git', 'not found', 'Install Git: https://git-scm.com/downloads')
    return
  }
  record('ok', 'Git', version.replace('git version ', ''))

  if (run('git rev-parse --is-inside-work-tree') !== 'true') {
    record(
      'fail',
      'Git repository',
      'this directory is not a repository',
      'The reviewer diffs the spec branch against main. Clone the course repository instead of downloading a ZIP.',
    )
    return
  }
  const branch = run('git branch --show-current') ?? '?'
  record('ok', 'Git repository', `branch ${branch}`)

  const hasMain = run('git rev-parse --verify --quiet main') !== null
  record(
    hasMain ? 'ok' : 'fail',
    'Branch main',
    hasMain ? 'present' : 'missing',
    hasMain ? null : 'Run: git fetch origin main:main',
  )

  const hasIdentity = Boolean(run('git config user.name')) && Boolean(run('git config user.email'))
  record(
    hasIdentity ? 'ok' : 'fail',
    'Git author name and email',
    hasIdentity ? 'set' : 'not set',
    hasIdentity
      ? null
      : 'Commits need them. Run: git config --global user.name "Your Name" and git config --global user.email "you@example.com"',
  )
}

function checkVsCode() {
  const version = run('code --version')
  if (!version) {
    record(
      'info',
      'VS Code',
      '`code` command not found in this terminal',
      'Not a blocker. Install VS Code (https://code.visualstudio.com) and check the Copilot extensions in the Extensions view by hand.',
    )
    return
  }
  record('ok', 'VS Code', version.split('\n')[0])

  const installed = (run('code --list-extensions') ?? '').toLowerCase().split('\n')
  const missing = COPILOT_EXTENSIONS.filter((id) => !installed.includes(id))
  record(
    missing.length === 0 ? 'ok' : 'fail',
    'GitHub Copilot extensions',
    missing.length === 0 ? 'installed' : `missing: ${missing.join(', ')}`,
    missing.length === 0
      ? null
      : 'Install "GitHub Copilot" and "GitHub Copilot Chat" from the Extensions view and sign in with your GitHub account.',
  )
}

function checkDependencies() {
  const isInstalled = existsSync(join('node_modules', 'vite')) && existsSync(join('node_modules', 'vitest'))
  record(
    isInstalled ? 'ok' : 'fail',
    'Project dependencies',
    isInstalled ? 'installed' : 'not installed',
    isInstalled ? null : 'Run: npm install',
  )
}

function checkProjectFiles() {
  const required = [
    'AGENTS.md',
    'docs/architecture/conventions.md',
    'docs/specs/SPEC-001-app-shell/spec.md',
    '.github/skills/sdd/SKILL.md',
    '.github/agents/code-reviewer.agent.md',
    '.github/prompts/review.prompt.md',
    '.vscode/settings.json',
    'workshop/prompts.html',
  ]
  const missing = required.filter((file) => !existsSync(file))
  record(
    missing.length === 0 ? 'ok' : 'fail',
    'Course files',
    missing.length === 0 ? 'in place' : `missing: ${missing.join(', ')}`,
    missing.length === 0 ? null : 'Run this from the root of the course repository.',
  )
}

function checkAgent() {
  const hasAgent = existsSync('.github/agents/react-engineer.agent.md')
  record(
    hasAgent ? 'ok' : 'info',
    'Agent react-engineer',
    hasAgent ? 'created' : 'not created yet',
    hasAgent ? null : 'Expected before step 2 of the workshop. Fallback: workshop/fallback/agents/react-engineer.agent.md',
  )
}

async function checkApi() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS)
  try {
    const response = await fetch(API_URL, { signal: controller.signal })
    record(
      response.ok ? 'ok' : 'warn',
      'Open API (dummyjson.com)',
      `HTTP ${response.status}`,
      response.ok ? null : 'The API returns an error. Work offline: npm run dev:offline',
    )
  } catch {
    record(
      'warn',
      'Open API (dummyjson.com)',
      'unreachable from this network',
      'Not a blocker. Start the app with: npm run dev:offline',
    )
  } finally {
    clearTimeout(timer)
  }
}

const MARKS = { ok: '[ OK ]', warn: '[WARN]', fail: '[FAIL]', info: '[INFO]' }

checkNode()
checkGit()
checkVsCode()
checkDependencies()
checkProjectFiles()
checkAgent()
await checkApi()

console.log(`\nSDD workshop readiness check (${process.platform})\n`)
for (const { level, name, detail, hint } of results) {
  console.log(`${MARKS[level]} ${name}: ${detail}`)
  if (hint) console.log(`       -> ${hint}`)
}

const failed = results.filter((result) => result.level === 'fail').length
const warned = results.filter((result) => result.level === 'warn').length
console.log(
  failed === 0
    ? `\nReady${warned > 0 ? ` (${warned} warning${warned === 1 ? '' : 's'})` : ''}.\n`
    : `\n${failed} item${failed === 1 ? '' : 's'} to fix. Everything else can wait.\n`,
)
process.exitCode = failed === 0 ? 0 : 1
