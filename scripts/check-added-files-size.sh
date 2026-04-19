#!/usr/bin/env bash
#
# check-added-files-size.sh
#
# Verifies that added or modified staged files do not exceed a specific size limit.
# Primarily used as a git pre-commit hook via Lefthook.
#
# Usage:
#   ./check-added-files-size.sh {staged_files}
#
# Example (lefthook.yml):
#   run: scripts/check-added-files-size.sh {staged_files}

set -euo pipefail

readonly MAX_BYTES=$((2 * 1024 * 1024)) # 2 MiB
readonly MAX_LABEL="2 MiB"

failed=0

for file in "$@"; do
  # Skip files that don't exist in the index (e.g. deleted files)
  if ! git cat-file -e ":$file" 2>/dev/null; then
    continue
  fi

  size=$(git cat-file -s ":$file")

  if [ "$size" -gt "$MAX_BYTES" ]; then
    echo "Staged file exceeds ${MAX_LABEL}: ${file} (${size} bytes)"
    failed=1
  fi
done

exit "$failed"
