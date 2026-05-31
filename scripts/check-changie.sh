#!/bin/bash
# Ensure a Changie fragment is committed on feature branches before pushing.
set -e

# Get current branch name safely
BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || git rev-parse --abbrev-ref HEAD)

# Skip checks on main and release branches
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "release-preview" ]; then
  exit 0
fi

# Fetch origin main to compare accurately
git fetch origin main --quiet || true

# 1. Ensure at least one Changie fragment file has been added/committed in the branch
ADDED_FRAGMENTS=$(git diff --name-only --diff-filter=A origin/main...HEAD | grep "^\.changie/unreleased/.*\.yaml$" || true)

if [ -z "$ADDED_FRAGMENTS" ]; then
  echo "❌ Error: No Changie fragment found in the Git commit history of this branch."
  echo "   Please run 'changie new' and commit the generated file before pushing."
  exit 1
fi

# 2. Validate syntax of the fragment files using batch --dry-run
changie batch patch --dry-run >/dev/null
echo "✔ Changie fragment validation passed."
exit 0
