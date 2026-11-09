#!/usr/bin/env bash
# Copies the kit's documents into the plugin, so an installed plugin is self-contained
# (installed plugins are copied to a cache; they cannot reach files outside their folder).
# The kit's docs/ and stacks/ stay the single source; never edit the copy.
# Layout: <parent>/rn-standards (the kit) and <parent>/claude-marketplace (this marketplace).
#
#   claude-marketplace/scripts/sync-standards.sh          # sync
#   claude-marketplace/scripts/sync-standards.sh --check  # exit 1 if the copy is stale (for CI / pre-commit)
set -euo pipefail

MARKETPLACE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# The kit sits next to the marketplace by default; override with KIT_DIR=/path/to/kit.
KIT="$(cd "${KIT_DIR:-$MARKETPLACE/../rn-standards}" && pwd)"
DEST="$MARKETPLACE/reviewer/references/standards"

if [[ "${1:-}" == "--check" ]]; then
  for dir in docs stacks; do
    if ! diff -rq "$KIT/$dir" "$DEST/$dir" >/dev/null 2>&1; then
      echo "stale: reviewer/references/standards/$dir — run claude-marketplace/scripts/sync-standards.sh" >&2
      exit 1
    fi
  done
  echo "standards copy is up to date"
  exit 0
fi

rm -rf "$DEST"
mkdir -p "$DEST"
for dir in docs stacks; do
  cp -R "$KIT/$dir" "$DEST/$dir"
done
find "$DEST" -name .DS_Store -delete
cat > "$DEST/README.md" <<'NOTE'
Generated copy of the kit's `docs/` and `stacks/` — do not edit.
Source of truth: the rn-standards kit. Refresh with `claude-marketplace/scripts/sync-standards.sh`.
NOTE
echo "synced docs/ and stacks/ into $DEST"
