#!/usr/bin/env bash
set -euo pipefail

# Installs git hooks from scripts/hooks into .git/hooks
HOOKS_DIR="$(pwd)/.githooks"
TARGET_DIR="$(pwd)/.git/hooks"

if [ ! -d "$TARGET_DIR" ]; then
  # In some CI/build environments (for example Vercel deployments) the
  # repository is provided as a source archive without a .git directory.
  # In that case, skip installing git hooks instead of failing the build.
  echo "No .git/hooks directory found. Skipping git hooks installation."
  exit 0
fi

mkdir -p "$TARGET_DIR"
for f in "$HOOKS_DIR"/*; do
  base=$(basename "$f")
  cp "$f" "$TARGET_DIR/$base"
  chmod +x "$TARGET_DIR/$base"
  echo "Installed hook: $base"
done

echo "Git hooks installed."
