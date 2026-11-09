#!/usr/bin/env bash
# Ranks source files (or modules) by review risk, so an audit reads the riskiest code
# first. Deterministic and read-only. The score is a heuristic for ordering, not a
# verdict: it counts signals that correlate with logic bugs.
#
#   async    await, Promise, then(, setTimeout/setInterval, subscribe, listeners
#   state    caches, queues, stores, persistence, retries, rollback, optimistic, ids
#   errors   catch, throw, reject
#   churn    commits touching the file in the last year
#   fixes    of those, commits whose subject starts with fix / bug / hotfix
#
# Usage: hotspots.sh [path ...] [--top N] [--modules [--depth D]]
#   path       scope to rank (default: the whole repository)
#   --top N    print at most N rows (default 30)
#   --modules  aggregate by module: the first D path components (default 3,
#              e.g. src/features/task-sync)
#
# Output (TSV): score  lines  async  state  errors  churn  fixes  path|module  [files]
set -euo pipefail

TOP=30
MODULES=0
DEPTH=3
PATHS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --top) TOP="$2"; shift 2 ;;
    --modules) MODULES=1; shift ;;
    --depth) DEPTH="$2"; shift 2 ;;
    *) PATHS+=("$1"); shift ;;
  esac
done

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

EXT='\.(ts|tsx|js|jsx|mjs|cjs|py|go|kt|java|swift|rb|rs|dart)$'
SKIP='(^|/)(node_modules|dist|build|coverage|vendor|ios/Pods|android/build|\.expo|\.next|__generated__|generated)/'
TEST='(^|/)(__tests__|__mocks__|tests?|testing|e2e|fixtures)/|\.(test|spec|stories|d)\.[a-z]+$'

list_files() {
  if git rev-parse --git-dir >/dev/null 2>&1; then
    git ls-files --cached --others --exclude-standard -- "${PATHS[@]:-.}"
  else
    find "${PATHS[@]:-.}" -type f | sed 's|^\./||'
  fi
}

HISTORY="$(mktemp)"
trap 'rm -f "$HISTORY"' EXIT
# One pass over history: "<churn>\t<fixes>\t<path>" per file touched in the last year.
if git rev-parse --git-dir >/dev/null 2>&1; then
  git log --since='1 year ago' --format='>>%s' --name-only -- "${PATHS[@]:-.}" 2>/dev/null | awk '
    /^>>/ { fix = (tolower(substr($0, 3)) ~ /^(fix|bug|hotfix)/); next }
    NF    { churn[$0]++; if (fix) fixes[$0]++ }
    END   { for (f in churn) printf "%d\t%d\t%s\n", churn[f], fixes[f], f }' > "$HISTORY"
fi

count() { grep -cE "$1" "$2" 2>/dev/null || true; }

score_files() {
  list_files | grep -E "$EXT" | grep -vE "$SKIP" | grep -vE "$TEST" | while IFS= read -r f; do
    [ -f "$f" ] || continue
    lines=$(grep -cv '^[[:space:]]*$' "$f" || true)
    async=$(count 'await |Promise[.<(]|\.then\(|setTimeout|setInterval|subscribe|addEventListener|addListener|onSnapshot|AbortController' "$f")
    state=$(count '[Cc]ache|[Qq]ueue|[Ss]tore\b|[Pp]ersist|[Ss]torage|[Rr]etry|[Rr]ollback|[Oo]ptimistic|[Ss]napshot|[Mm]erge|[Rr]econcil|[Ll]ocalId|tempId|[Mm]igrat|[Tt]ransaction|[Ll]ock\b|[Mm]utex|useReducer' "$f")
    errors=$(count 'catch|throw |reject' "$f")
    printf '%s\t%s\t%s\t%s\t%s\n' "$lines" "$async" "$state" "$errors" "$f"
  done | awk -F'\t' -v hist="$HISTORY" '
    BEGIN { while ((getline l < hist) > 0) { split(l, h, "\t"); churn[h[3]] = h[1]; fixes[h[3]] = h[2] } }
    {
      c = churn[$5] + 0; x = fixes[$5] + 0
      score = $2 * 3 + $3 * 2 + $4 * 2 + c + x * 4 + int($1 / 40)
      printf "%d\t%d\t%d\t%d\t%d\t%d\t%d\t%s\n", score, $1, $2, $3, $4, c, x, $5
    }'
}

if [ "$MODULES" = 1 ]; then
  printf 'score\tlines\tasync\tstate\terrors\tchurn\tfixes\tmodule\tfiles\n'
  score_files | awk -F'\t' -v d="$DEPTH" '
    {
      n = split($8, p, "/"); key = p[1]
      for (i = 2; i <= d && i < n; i++) key = key "/" p[i]
      for (c = 1; c <= 7; c++) s[key, c] += $c
      files[key]++; keys[key] = 1
    }
    END {
      for (k in keys) printf "%d\t%d\t%d\t%d\t%d\t%d\t%d\t%s\t%d\n", s[k,1], s[k,2], s[k,3], s[k,4], s[k,5], s[k,6], s[k,7], k, files[k]
    }' | sort -t$'\t' -k1,1nr | head -n "$TOP"
else
  printf 'score\tlines\tasync\tstate\terrors\tchurn\tfixes\tpath\n'
  score_files | sort -t$'\t' -k1,1nr | head -n "$TOP"
fi
