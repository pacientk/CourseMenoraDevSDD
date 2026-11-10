#!/usr/bin/env node
// Catch up with the group: jump to the finished state of the project after a given step.
//   npm run catchup          — list the checkpoints
//   npm run catchup -- 4     — jump to checkpoint 4
// Your current work is not lost: it is saved on a backup/… branch and, if there were
// uncommitted changes, in git stash.

import { execFileSync } from 'node:child_process'

const SPEC_001_DONE = 'cp/2-spec-001-done'
const SPEC_002_BRANCH = 'spec/002-customer-profile'

const CHECKPOINTS = [
  { n: 1, tag: 'cp/1-agent', branch: 'main', title: 'react-engineer agent created', next: 'step 3: /sdd run SPEC-001 --commit' },
  { n: 2, tag: SPEC_001_DONE, branch: 'main', title: 'SPEC-001 closed and merged into main', next: 'step 4: /sdd epic customer-profile' },
  { n: 3, tag: 'cp/3-spec-002-docs', branch: SPEC_002_BRANCH, title: 'SPEC-002: epic approved, tasks and plan ready', next: 'step 5: /sdd run SPEC-002 --commit (wave 1)' },
  { n: 4, tag: 'cp/4-wave-1', branch: SPEC_002_BRANCH, title: 'Wave 1 done', next: 'step 5: /sdd run SPEC-002 --commit (wave 2)' },
  { n: 5, tag: 'cp/5-wave-2', branch: SPEC_002_BRANCH, title: 'Wave 2 done', next: 'step 5: /sdd run SPEC-002 --commit (wave 3)' },
  { n: 6, tag: 'cp/6-wave-3', branch: SPEC_002_BRANCH, title: 'Wave 3 done, the page works', next: 'step 6: /review' },
  { n: 7, tag: 'cp/7-review-fixed', branch: SPEC_002_BRANCH, title: 'Review passed, findings fixed', next: 'step 7: /security-review' },
  { n: 8, tag: 'cp/8-spec-002-done', branch: 'main', title: 'SPEC-002 closed and merged into main', next: 'done: /sdd status' },
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
  console.log('\nWorkshop checkpoints:\n')
  let missing = 0
  for (const point of CHECKPOINTS) {
    const isAvailable = hasTag(point.tag)
    if (!isAvailable) missing += 1
    console.log(`  ${point.n}  ${point.title}${isAvailable ? '' : '  — tag not found'}`)
  }
  if (missing > 0) console.log('\nSome tags are missing. Run: git fetch --tags origin')
  console.log('\nJump: npm run catchup -- <number>\n')
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
    throw new Error(`Tag ${point.tag} not found. Run: git fetch --tags origin`)
  }

  const { backup, isDirty } = saveCurrentWork()

  if (point.branch === 'main') {
    git(['switch', 'main'])
    git(['reset', '--hard', point.tag])
  } else {
    // The reviewer diffs the spec branch against main, so main must contain SPEC-001.
    moveBranch('main', SPEC_001_DONE)
    git(['switch', '--force-create', point.branch, point.tag])
  }

  console.log(`\nYou are at checkpoint ${point.n}: ${point.title}`)
  console.log(`Branch: ${git(['branch', '--show-current'])}`)
  console.log(`Your previous work: branch ${backup}${isDirty ? ' and git stash (git stash list)' : ''}`)
  console.log(`Next, per workshop/prompts.html — ${point.next}`)
  console.log('Start a new Copilot chat so the agent does not rely on the old conversation.\n')
}

const arg = process.argv[2]
if (!arg) {
  printList()
} else {
  const point = CHECKPOINTS.find((candidate) => String(candidate.n) === arg)
  if (!point) {
    console.error(`No checkpoint "${arg}".`)
    printList()
    process.exitCode = 1
  } else {
    try {
      goTo(point)
    } catch (error) {
      console.error(`\nFailed: ${error instanceof Error ? error.message : String(error)}\n`)
      process.exitCode = 1
    }
  }
}
