#!/usr/bin/env bash
# Prints what the reviewer needs to know about the project it was started in:
# review mode, where the standards come from, gate commands, branches, changed files.
# Read-only. Output is "key: value" lines; lists are indented with "  - ".
set -uo pipefail

PLUGIN_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT" || exit 1

echo "project_root: $ROOT"

# --- Mode -------------------------------------------------------------------
mode="adaptive"
if [[ -f standards.config.json ]]; then
  stack="$(node -e 'try{console.log(require(process.argv[1]).stack||"")}catch{console.log("")}' "$ROOT/standards.config.json" 2>/dev/null \
    || sed -nE 's/.*"stack"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/p' standards.config.json | head -1)"
  if [[ -f "standards/stacks/$stack.md" ]]; then
    mode="kit"; standards_dir="$ROOT/standards"; standards_source="project (vendored kit)"
  elif [[ -f "$PLUGIN_ROOT/references/standards/stacks/$stack.md" ]]; then
    mode="kit"; standards_dir="$PLUGIN_ROOT/references/standards"; standards_source="plugin (bundled copy)"
  fi
  echo "profile_json: $ROOT/standards.config.json"
  echo "stack: ${stack:-<missing>}"
  [[ -f docs/PROJECT-PROFILE.md ]] && echo "profile_md: $ROOT/docs/PROJECT-PROFILE.md" || echo "profile_md: <missing>"
  if [[ "$mode" == "kit" ]]; then
    echo "standards_dir: $standards_dir"
    echo "standards_source: $standards_source"
    echo "stack_manifest: $standards_dir/stacks/$stack.md"
  else
    echo "warning: standards.config.json present but no manifest for stack \"$stack\" — falling back to adaptive mode"
  fi
fi
echo "mode: $mode"
echo "bundled_core_docs: $PLUGIN_ROOT/references/standards/docs/core"

# --- Project conventions (read these in adaptive mode; CLAUDE.md in both) -----
echo "convention_files:"
find . -maxdepth 4 \( -name node_modules -o -name .git -o -name standards -o -name ios -o -name android \) -prune -o -type f \( \
  -name 'CLAUDE.md' -o -name 'AGENTS.md' -o -name 'CONTRIBUTING.md' -o -name 'ARCHITECTURE.md' \
  -o -name 'eslint.config.*' -o -name '.eslintrc*' -o -name 'biome.json' -o -name 'biome.jsonc' \
  -o -name 'tsconfig.json' -o -name '.prettierrc*' -o -name 'prettier.config.*' \
  -o -name 'pyproject.toml' -o -name 'ruff.toml' -o -name 'Makefile' -o -name 'go.mod' -o -name 'Cargo.toml' \) \
  -print 2>/dev/null | sed 's#^\./#  - #' | sort | head -40

# --- Gates --------------------------------------------------------------------
pm="npm"
[[ -f pnpm-lock.yaml ]] && pm="pnpm"
[[ -f yarn.lock ]] && pm="yarn"
[[ -f bun.lockb || -f bun.lock ]] && pm="bun"
if [[ -f package.json ]]; then
  echo "package_manager: $pm"
  echo "package_scripts:"
  node -e '
    const s = require(process.argv[1]).scripts || {};
    const re = /^(type-?check|tsc|typescript|lint|eslint|test|tests|check|verify|validate|ci)(:.*)?$/i;
    for (const [k, v] of Object.entries(s)) if (re.test(k)) console.log(`  - ${k}: ${v}`);
  ' "$ROOT/package.json" 2>/dev/null
  [[ -f tsconfig.json ]] && echo "typecheck_fallback: npx tsc --noEmit"
fi
if [[ -f Makefile ]]; then
  echo "make_targets:"
  grep -oE '^(lint|test|check|typecheck|ci)[a-zA-Z_-]*:' Makefile | sed 's/:$//; s/^/  - make /'
fi

# --- Branches and scope --------------------------------------------------------
if git rev-parse --git-dir >/dev/null 2>&1; then
  current="$(git branch --show-current 2>/dev/null)"
  base="$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null | sed 's#^origin/##')"
  if [[ -z "$base" ]]; then
    for candidate in main master development develop; do
      git show-ref --verify --quiet "refs/heads/$candidate" && { base="$candidate"; break; }
    done
  fi
  echo "current_branch: ${current:-<detached>}"
  echo "integration_branch_guess: ${base:-<unknown>} (the profile, if any, is authoritative)"
  if [[ -n "$base" && "$base" != "$current" ]]; then
    mb="$(git merge-base "$base" HEAD 2>/dev/null)"
    if [[ -n "$mb" ]]; then
      echo "branch_diff: git diff $base...HEAD"
      echo "branch_changed_files: $(git diff --name-only "$mb" HEAD | wc -l | tr -d ' ')"
    fi
  fi
  echo "uncommitted_files: $(git status --porcelain | wc -l | tr -d ' ')"
else
  echo "git: not a repository — scope must be given explicitly"
fi
