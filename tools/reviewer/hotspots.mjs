#!/usr/bin/env node
// Ranks source files (or modules) by review risk so an audit reads the riskiest code
// first. Deterministic and read-only. The score orders reading; it is not a verdict.
//
//   async    await, Promise, then(, setTimeout/setInterval, subscribe, listeners
//   state    caches, queues, stores, persistence, retries, rollback, optimistic, ids
//   errors   catch, throw, reject
//   churn    commits touching the file in the last year
//   fixes    of those, commits whose subject starts with fix / bug / hotfix
//
// Usage: node tools/reviewer/hotspots.mjs [path ...] [--top N] [--modules [--depth D]]
// Output (TSV): score  lines  async  state  errors  churn  fixes  path|module

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const args = process.argv.slice(2)
let top = 30
let modules = false
let depth = 3
const paths = []
for (let i = 0; i < args.length; i += 1) {
  const arg = args[i]
  if (arg === '--top') top = Number(args[++i])
  else if (arg === '--modules') modules = true
  else if (arg === '--depth') depth = Number(args[++i])
  else paths.push(arg)
}

function git(gitArgs) {
  return execFileSync('git', gitArgs, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 })
}

const SOURCE = /\.(ts|tsx|js|jsx|mjs)$/
const EXCLUDE = /(^|\/)(node_modules|dist|coverage|__tests__|__mocks__|mocks|tools|scripts)\//
const TEST = /\.(test|spec)\.[tj]sx?$/

const tracked = git(['ls-files', ...paths]).split('\n').filter((file) => file && SOURCE.test(file) && !EXCLUDE.test(file) && !TEST.test(file))

const ASYNC = /\bawait\b|\bPromise\b|\.then\(|setTimeout|setInterval|subscribe|addEventListener|AbortController/g
const STATE = /\bcache|\bqueue|\bstore\b|localStorage|sessionStorage|\bretry|rollback|optimistic|\bid\b|\bids\b|useState|useReducer|useRef|useEffect/g
const ERRORS = /\bcatch\b|\bthrow\b|\breject\b/g

const churn = new Map()
const fixes = new Map()
const log = git(['log', '--since=1 year', '--name-only', '--format=%x00%s'])
let isFix = false
for (const line of log.split('\n')) {
  if (line.startsWith('\u0000')) {
    isFix = /^(fix|bug|hotfix)/i.test(line.slice(1))
  } else if (line.trim() !== '') {
    churn.set(line, (churn.get(line) ?? 0) + 1)
    if (isFix) fixes.set(line, (fixes.get(line) ?? 0) + 1)
  }
}

function count(text, regex) {
  return (text.match(regex) ?? []).length
}

const rows = tracked.map((file) => {
  const text = readFileSync(file, 'utf8')
  const lines = text.split('\n').length
  const asyncCount = count(text, ASYNC)
  const stateCount = count(text, STATE)
  const errorCount = count(text, ERRORS)
  const churnCount = churn.get(file) ?? 0
  const fixCount = fixes.get(file) ?? 0
  const score = asyncCount * 3 + stateCount * 2 + errorCount * 2 + churnCount * 2 + fixCount * 5 + Math.floor(lines / 50)
  return { score, lines, async: asyncCount, state: stateCount, errors: errorCount, churn: churnCount, fixes: fixCount, path: file }
})

let output = rows
if (modules) {
  const byModule = new Map()
  for (const row of rows) {
    const key = row.path.split('/').slice(0, depth).join('/')
    const acc = byModule.get(key) ?? { score: 0, lines: 0, async: 0, state: 0, errors: 0, churn: 0, fixes: 0, path: key, files: 0 }
    for (const field of ['score', 'lines', 'async', 'state', 'errors', 'churn', 'fixes']) acc[field] += row[field]
    acc.files += 1
    byModule.set(key, acc)
  }
  output = [...byModule.values()]
}

output.sort((a, b) => b.score - a.score || a.path.localeCompare(b.path))
console.log(['score', 'lines', 'async', 'state', 'errors', 'churn', 'fixes', modules ? 'module' : 'path', modules ? 'files' : ''].join('\t').trimEnd())
for (const row of output.slice(0, top)) {
  const cells = [row.score, row.lines, row.async, row.state, row.errors, row.churn, row.fixes, row.path]
  if (modules) cells.push(row.files)
  console.log(cells.join('\t'))
}
