#!/usr/bin/env node
// Checks a spec document for unfilled template slots.
//   node scripts/spec-lint.mjs docs/specs/SPEC-002-customer-profile/epic.md
// Prints "OK" and exits 0 when nothing is left; otherwise lists line numbers and exits 1.

import { readFileSync } from 'node:fs'

const file = process.argv[2]
if (!file) {
  console.error('Usage: node scripts/spec-lint.mjs <path-to-markdown>')
  process.exit(2)
}

const PATTERNS = [
  { name: 'template slot {…}', regex: /\{[^}\n]*…[^}\n]*\}/ },
  { name: 'spec number placeholder {NNN}', regex: /\{NNN\}/ },
  { name: 'date placeholder', regex: /YYYY-MM-DD/ },
  { name: 'generic placeholder', regex: /\{(short title|name|title|Title)\}/ },
]

const lines = readFileSync(file, 'utf8').split('\n')
const problems = []
lines.forEach((line, index) => {
  for (const pattern of PATTERNS) {
    if (pattern.regex.test(line)) problems.push(`${file}:${index + 1}: ${pattern.name} — ${line.trim()}`)
  }
})

if (problems.length === 0) {
  console.log('OK')
} else {
  for (const problem of problems) console.log(problem)
  console.log(`\n${problems.length} unfilled slot(s)`)
  process.exitCode = 1
}
