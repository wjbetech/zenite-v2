#!/usr/bin/env bash
set -euo pipefail

# Simple repo secret scanner used by pre-commit and CI
# Exits non-zero if suspicious patterns are found

ROOT_DIR="$(git rev-parse --show-toplevel)"

echo "Running secret-scan in $ROOT_DIR"

# Patterns to scan for (add more as needed)
# Default patterns (loose). In local mode we use stricter regexes to avoid doc hits.
# Default patterns (loose). In local mode we use stricter regexes to avoid doc hits.
read -r -d '' PATTERNS <<'PATTERNS_EOF' || true
postgresql://
pk_test_
sk_test_
PATTERNS_EOF

read -r -d '' STRICT_PATTERNS <<'STRICT_EOF' || true
# values like CLERK_SECRET_KEY=sk_live_xxx or JSON-like keys
CLERK_SECRET_KEY=[a-zA-Z0-9_-]{10,}
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=[a-zA-Z0-9_-]{10,}
DATABASE_URL=postgresql://[^\"]{10,}
STRICT_EOF

# Files or paths to ignore (patterns matched against the path)
read -r -d '' IGNORE_PATHS <<'IGNORE_EOF' || true
^README.md$
^deploy/README.md$
^TODO.md$
^docs/
^\.env.example$
^scripts/secret-scan.sh$
^prisma/
^deploy/
^src/components/Providers.tsx$
^src/components/clerkKeyGuard.ts$
^src/components/__tests__/clerkKeyGuard.test.ts$
^src/components/__tests__/Providers.clerk.test.tsx$
IGNORE_EOF

# Allow a permissive local mode (for developer pre-commit) to reduce false positives
LOCAL_MODE=0
if [ "${1-}" = "--local" ]; then
  LOCAL_MODE=1
  echo "Secret-scan: running in local (permissive) mode"
fi

FOUND=0
for p in "${PATTERNS[@]}"; do
  # Find matches including untracked files, then filter out ignored paths
  if git grep -I --line-number --untracked --no-color -e "$p" >/dev/null 2>&1; then
    # collect matches into a variable
    matches=$(git --no-pager grep -I --line-number --untracked --no-color -e "$p" || true)
    if [ -n "$matches" ]; then
      # iterate each matching line (format: path:line:content) and skip ignored paths
      while IFS= read -r line; do
        # extract path portion
        path=$(echo "$line" | awk -F: '{print $1}')
        skip=0
        # iterate ignore patterns
        while IFS= read -r ign; do
          if echo "$path" | grep -E -q "$ign"; then
            skip=1
            break
          fi
        done <<< "$IGNORE_PATHS"
        if [ $skip -eq 0 ]; then
          # print the original match line
          echo "$line"
          FOUND=1
        fi
      done <<< "$matches"
      if [ $FOUND -eq 1 ]; then
        echo "Potential secret pattern found: $p"
      fi
    fi
  fi
done

# In local mode, also run the stricter patterns but skip printing matches from docs/prisma
if [ $LOCAL_MODE -eq 1 ]; then
  for p in "${STRICT_PATTERNS[@]}"; do
    if git grep -I --line-number --untracked --no-color -E -e "$p" >/dev/null 2>&1; then
      matches=$(git --no-pager grep -I --line-number --untracked --no-color -E -e "$p" || true)
      if [ -n "$matches" ]; then
        while IFS= read -r line; do
          path=$(echo "$line" | awk -F: '{print $1}')
          skip=0
          while IFS= read -r ign; do
            if echo "$path" | grep -E -q "$ign"; then
              skip=1
              break
            fi
          done <<< "$IGNORE_PATHS"
          if [ $skip -eq 0 ]; then
            echo "$line"
            FOUND=1
          fi
        done <<< "$matches"
        if [ $FOUND -eq 1 ]; then
          echo "Potential secret pattern found (strict): $p"
        fi
      fi
    fi
  done
fi

if [ $FOUND -ne 0 ]; then
  echo "Secret scan failed: potential secrets found. Fix or remove them before committing."
  exit 1
fi

echo "Secret scan passed."
exit 0

