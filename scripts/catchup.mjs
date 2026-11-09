#!/usr/bin/env node
// Догнать группу: перейти на готовое состояние проекта после нужного шага.
//   npm run catchup          — показать список контрольных точек
//   npm run catchup -- 4     — перейти к точке 4
// Текущая работа не теряется: она сохраняется в ветке backup/… и, если были
// незакоммиченные правки, в git stash.

import { execFileSync } from 'node:child_process'

const SPEC_001_DONE = 'cp/2-spec-001-done'
const SPEC_002_BRANCH = 'spec/002-customer-profile'

const CHECKPOINTS = [
  { n: 1, tag: 'cp/1-agent', branch: 'main', title: 'Агент react-engineer создан', next: 'шаг 3: /sdd run SPEC-001 --commit' },
  { n: 2, tag: SPEC_001_DONE, branch: 'main', title: 'SPEC-001 закрыта и влита в main', next: 'шаг 4: /sdd epic customer-profile' },
  { n: 3, tag: 'cp/3-spec-002-docs', branch: SPEC_002_BRANCH, title: 'SPEC-002: эпик утверждён, задачи и план готовы', next: 'шаг 5: /sdd run SPEC-002 --commit (волна 1)' },
  { n: 4, tag: 'cp/4-wave-1', branch: SPEC_002_BRANCH, title: 'Волна 1 исполнена', next: 'шаг 5: /sdd run SPEC-002 --commit (волна 2)' },
  { n: 5, tag: 'cp/5-wave-2', branch: SPEC_002_BRANCH, title: 'Волна 2 исполнена', next: 'шаг 5: /sdd run SPEC-002 --commit (волна 3)' },
  { n: 6, tag: 'cp/6-wave-3', branch: SPEC_002_BRANCH, title: 'Волна 3 исполнена, страница работает', next: 'шаг 6: /reviewer:review' },
  { n: 7, tag: 'cp/7-review-fixed', branch: SPEC_002_BRANCH, title: 'Ревью пройдено, замечания исправлены', next: 'шаг 7: /security-review' },
  { n: 8, tag: 'cp/8-spec-002-done', branch: 'main', title: 'SPEC-002 закрыта и влита в main', next: 'готово: /sdd status' },
]

function git(args, { allowFail = false } = {}) {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  } catch (error) {
    if (allowFail) return null
    const detail = error.stderr ? String(error.stderr).trim() : String(error.message)
    throw new Error(`git ${args.join(' ')}\n${detail}`)
  }
}

function hasTag(tag) {
  return git(['rev-parse', '--verify', '--quiet', `refs/tags/${tag}`], { allowFail: true }) !== null
}

function printList() {
  console.log('\nКонтрольные точки курса:\n')
  let missing = 0
  for (const point of CHECKPOINTS) {
    const isAvailable = hasTag(point.tag)
    if (!isAvailable) missing += 1
    console.log(`  ${point.n}  ${point.title}${isAvailable ? '' : '  — тег не найден'}`)
  }
  if (missing > 0) console.log('\nНе все теги на месте. Выполните: git fetch --tags origin')
  console.log('\nПерейти: npm run catchup -- <номер>\n')
}

function saveCurrentWork() {
  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
  const backup = `backup/${stamp}`
  git(['branch', backup])
  const isDirty = git(['status', '--porcelain']) !== ''
  if (isDirty) {
    git(['stash', 'push', '--include-untracked', '--message', `catchup ${stamp}`])
  }
  return { backup, isDirty }
}

function moveBranch(branch, tag) {
  const current = git(['branch', '--show-current'])
  if (current === branch) git(['reset', '--hard', tag])
  else git(['branch', '--force', branch, tag])
}

function goTo(point) {
  if (!hasTag(point.tag)) {
    git(['fetch', '--tags', 'origin'], { allowFail: true })
  }
  if (!hasTag(point.tag)) {
    throw new Error(`Тег ${point.tag} не найден. Выполните: git fetch --tags origin`)
  }

  const { backup, isDirty } = saveCurrentWork()

  if (point.branch === 'main') {
    git(['switch', 'main'])
    git(['reset', '--hard', point.tag])
  } else {
    // Ревьюер сравнивает ветку спеки с main, поэтому main должен содержать SPEC-001.
    moveBranch('main', SPEC_001_DONE)
    git(['switch', '--force-create', point.branch, point.tag])
  }

  console.log(`\nВы на точке ${point.n}: ${point.title}`)
  console.log(`Ветка: ${git(['branch', '--show-current'])}`)
  console.log(`Ваша прежняя работа: ветка ${backup}${isDirty ? ' и git stash (git stash list)' : ''}`)
  console.log(`Дальше по PROMPTS.md — ${point.next}`)
  console.log('Перезапустите сессию Claude Code: /exit, затем claude\n')
}

const arg = process.argv[2]
if (!arg) {
  printList()
} else {
  const point = CHECKPOINTS.find((candidate) => String(candidate.n) === arg)
  if (!point) {
    console.error(`Нет контрольной точки «${arg}».`)
    printList()
    process.exitCode = 1
  } else {
    try {
      goTo(point)
    } catch (error) {
      console.error(`\nНе получилось: ${error instanceof Error ? error.message : String(error)}\n`)
      process.exitCode = 1
    }
  }
}
