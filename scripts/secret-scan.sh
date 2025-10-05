#!/usr/bin/env bash
set -euo pipefail

# Simple repo secret scanner used by pre-commit and CI
# Exits non-zero if suspicious patterns are found

ROOT_DIR="$(git rev-parse --show-toplevel)"

echo "Running secret-scan in $ROOT_DIR"

# Patterns to scan for (add more as needed)
PATTERNS=(
  "postgresql://"
  "pk_test_"
  "sk_test_"
  "CLERK_SECRET_KEY"
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  "DATABASE_URL"
)

FOUND=0
for p in "${PATTERNS[@]}"; do
  if git grep -I --line-number --untracked --no-color "$p" >/dev/null 2>&1; then
    echo "Potential secret pattern found: $p"
    git --no-pager grep -I --line-number --untracked --no-color "$p"
    FOUND=1
  fi
done

if [ $FOUND -ne 0 ]; then
  echo "Secret scan failed: potential secrets found. Fix or remove them before committing."
  exit 1
fi

echo "Secret scan passed."
exit 0

