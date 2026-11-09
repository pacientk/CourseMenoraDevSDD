#!/usr/bin/env node
// Проверка готовности машины к курсу: `npm run doctor`.
// Работает на macOS, Linux и Windows. Ничего не изменяет.

import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const MIN_NODE = [22, 12]
const API_URL = 'https://dummyjson.com/users/1'
const API_TIMEOUT_MS = 8000

const results = []

function record(level, name, detail, hint) {
  results.push({ level, name, detail, hint })
}

function run(command) {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }).trim()
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
    isOk ? null : `Нужен Node ${MIN_NODE.join('.')} или новее: https://nodejs.org`,
  )
}

function checkGit() {
  const version = run('git --version')
  if (!version) {
    record('fail', 'Git', 'не найден', 'Установите Git: https://git-scm.com/downloads')
    return
  }
  record('ok', 'Git', version.replace('git version ', ''))

  if (run('git rev-parse --is-inside-work-tree') !== 'true') {
    record(
      'fail',
      'Git-репозиторий',
      'каталог не является репозиторием',
      'Ревьюер сравнивает ветку с main. Клонируйте репозиторий или выполните: git init -b main && git add -A && git commit -m "chore: starter"',
    )
    return
  }
  const branch = run('git branch --show-current') ?? '?'
  record('ok', 'Git-репозиторий', `ветка ${branch}`)

  const hasIdentity = Boolean(run('git config user.name')) && Boolean(run('git config user.email'))
  record(
    hasIdentity ? 'ok' : 'fail',
    'Git: имя и почта автора',
    hasIdentity ? 'заданы' : 'не заданы',
    hasIdentity ? null : 'Без них не создаётся коммит. Выполните: git config --global user.name "Имя" и git config --global user.email "почта"',
  )

  const hasOrigin = run('git rev-parse --verify --quiet origin/HEAD') !== null
  record(
    hasOrigin ? 'ok' : 'warn',
    'origin/HEAD',
    hasOrigin ? 'найден' : 'не найден',
    hasOrigin
      ? null
      : 'Команда /security-review может не определить базу. Запасной промпт — в workshop/PROMPTS.md, шаг 7.',
  )
}

function checkClaude() {
  const version = run('claude --version')
  record(
    version ? 'ok' : 'fail',
    'Claude Code',
    version ?? 'не найден',
    version ? null : 'Установите Claude Code: https://claude.com/claude-code и войдите в аккаунт.',
  )
}

function checkDependencies() {
  const isInstalled = existsSync(join('node_modules', 'vite')) && existsSync(join('node_modules', 'vitest'))
  record(
    isInstalled ? 'ok' : 'fail',
    'Зависимости проекта',
    isInstalled ? 'установлены' : 'не установлены',
    isInstalled ? null : 'Выполните: npm install',
  )
}

function checkProjectFiles() {
  const required = [
    'CLAUDE.md',
    'docs/architecture/conventions.md',
    'docs/specs/SPEC-001-app-shell/spec.md',
    '.claude/skills/sdd/SKILL.md',
    'workshop/PROMPTS.md',
  ]
  const missing = required.filter((file) => !existsSync(file))
  record(
    missing.length === 0 ? 'ok' : 'fail',
    'Файлы курса',
    missing.length === 0 ? 'на месте' : `нет: ${missing.join(', ')}`,
    missing.length === 0 ? null : 'Запускайте из корня репозитория курса.',
  )
}

function checkAgent() {
  const hasAgent = existsSync('.claude/agents/react-engineer.md')
  record(
    hasAgent ? 'ok' : 'info',
    'Агент react-engineer',
    hasAgent ? 'создан' : 'ещё не создан',
    hasAgent ? null : 'Это нормально до шага 2 курса. Запасной вариант: workshop/fallback/agents/react-engineer.md',
  )
}

function checkReviewerPlugin() {
  const file = join(homedir(), '.claude', 'plugins', 'installed_plugins.json')
  let isInstalled = false
  if (existsSync(file)) {
    try {
      const data = JSON.parse(readFileSync(file, 'utf8'))
      isInstalled = Object.keys(data.plugins ?? {}).some((key) => key.startsWith('reviewer@'))
    } catch {
      isInstalled = false
    }
  }
  record(
    isInstalled ? 'ok' : 'info',
    'Плагин reviewer',
    isInstalled ? 'установлен' : 'ещё не установлен',
    isInstalled ? null : 'Это нормально до шага 1 курса. Команды установки — в workshop/PROMPTS.md, шаг 1.',
  )
}

async function checkApi() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS)
  try {
    const response = await fetch(API_URL, { signal: controller.signal })
    record(
      response.ok ? 'ok' : 'warn',
      'Открытый API (dummyjson.com)',
      `HTTP ${response.status}`,
      response.ok ? null : 'API отвечает ошибкой. Работайте в офлайн-режиме: npm run dev:offline',
    )
  } catch {
    record(
      'warn',
      'Открытый API (dummyjson.com)',
      'недоступен из этой сети',
      'Не блокирует курс. Запускайте приложение так: npm run dev:offline',
    )
  } finally {
    clearTimeout(timer)
  }
}

const MARKS = { ok: '[ OK ]', warn: '[WARN]', fail: '[FAIL]', info: '[INFO]' }

checkNode()
checkGit()
checkClaude()
checkDependencies()
checkProjectFiles()
checkAgent()
checkReviewerPlugin()
await checkApi()

console.log('\nПроверка готовности к курсу SDD\n')
for (const { level, name, detail, hint } of results) {
  console.log(`${MARKS[level]} ${name}: ${detail}`)
  if (hint) console.log(`       -> ${hint}`)
}

const failed = results.filter((result) => result.level === 'fail').length
const warned = results.filter((result) => result.level === 'warn').length
console.log(
  failed === 0
    ? `\nГотово к работе${warned > 0 ? ` (предупреждений: ${warned})` : ''}.\n`
    : `\nНужно исправить: ${failed}. Остальное можно делать после.\n`,
)
process.exitCode = failed === 0 ? 0 : 1
