#!/usr/bin/env node
// Prints what the reviewer needs to know about the project: convention files, gate
// commands, branches and the size of the change. Read-only. Works on Windows and macOS.
// Output: "key: value" lines; lists are indented with "  - ".

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

function git(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return null
  }
}

const root = git(['rev-parse', '--show-toplevel']) ?? process.cwd()
process.chdir(root)
console.log(`project_root: ${root}`)

// --- Convention files ---------------------------------------------------------
const CONVENTION_NAMES = new Set([
  'AGENTS.md', 'CONTRIBUTING.md', 'ARCHITECTURE.md', 'conventions.md',
  '.oxlintrc.json', 'eslint.config.js', 'eslint.config.mjs', 'eslint.config.ts', 'biome.json',
  'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json',
])
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'coverage', 'archive'])

function walk(dir, depth, out) {
  if (depth > 4) return
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(join(dir, entry.name), depth + 1, out)
    } else if (CONVENTION_NAMES.has(entry.name)) {
      out.push(relative(root, join(dir, entry.name)).split('\\').join('/'))
    }
  }
}
const conventions = []
walk(root, 0, conventions)
console.log('convention_files:')
for (const file of conventions.sort()) console.log(`  - ${file}`)

// --- Gates ---------------------------------------------------------------------
if (existsSync('package.json')) {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
  const scripts = pkg.scripts ?? {}
  const gateLike = /^(type-?check|tsc|lint|test|tests|check|verify|validate|ci|audit(:.*)?|release:check)(:.*)?$/i
  console.log('package_scripts:')
  for (const [name, command] of Object.entries(scripts)) {
    if (gateLike.test(name)) console.log(`  - ${name}: ${command}`)
  }
  if (existsSync('tsconfig.json') && !scripts.typecheck) console.log('typecheck_fallback: npx tsc --noEmit')
}

// --- Branches and scope ----------------------------------------------------------
if (git(['rev-parse', '--git-dir']) === null) {
  console.log('git: not a repository — scope must be given explicitly')
} else {
  const current = git(['branch', '--show-current']) || '<detached>'
  let base = null
  for (const candidate of ['main', 'master', 'develop']) {
    if (git(['show-ref', '--verify', '--quiet', `refs/heads/${candidate}`]) !== null) {
      base = candidate
      break
    }
  }
  console.log(`current_branch: ${current}`)
  console.log(`integration_branch: ${base ?? '<unknown>'}`)
  if (base && base !== current) {
    const mergeBase = git(['merge-base', base, 'HEAD'])
    if (mergeBase) {
      const changed = git(['diff', '--name-only', mergeBase, 'HEAD']) ?? ''
      const files = changed === '' ? [] : changed.split('\n')
      console.log(`branch_diff: git diff ${base}...HEAD`)
      console.log(`branch_changed_files: ${files.length}`)
      console.log('changed_files:')
      for (const file of files) console.log(`  - ${file}`)
    }
  }
  const status = git(['status', '--porcelain']) ?? ''
  console.log(`uncommitted_files: ${status === '' ? 0 : status.split('\n').length}`)
}

// --- Spec documents ---------------------------------------------------------------
const specsDir = join(root, 'docs', 'specs')
if (existsSync(specsDir)) {
  console.log('specs:')
  for (const name of readdirSync(specsDir).sort()) {
    const dir = join(specsDir, name)
    if (!statSync(dir).isDirectory()) continue
    const files = readdirSync(dir).filter((file) => file.endsWith('.md')).sort()
    console.log(`  - docs/specs/${name}: ${files.join(', ')}`)
  }
}
