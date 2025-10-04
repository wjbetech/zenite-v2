#!/usr/bin/env bash
set -euo pipefail

# Installs git hooks from scripts/hooks into .git/hooks
HOOKS_DIR="$(pwd)/.githooks"
TARGET_DIR="$(pwd)/.git/hooks"

if [ ! -d "$TARGET_DIR" ]; then
  echo "No .git/hooks directory found. Are you in the repo root?"
  exit 1
fi

mkdir -p "$TARGET_DIR"
for f in "$HOOKS_DIR"/*; do
  base=$(basename "$f")
  cp "$f" "$TARGET_DIR/$base"
  chmod +x "$TARGET_DIR/$base"
  echo "Installed hook: $base"
done

echo "Git hooks installed."
