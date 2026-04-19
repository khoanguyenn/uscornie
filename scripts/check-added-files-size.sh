#!/usr/bin/env bash

set -euo pipefail

readonly MAX_BYTES=$((2 * 1024 * 1024))
readonly MAX_LABEL="2 MiB"

failed=0

while IFS= read -r -d '' file; do
  size=$(git cat-file -s ":$file")

  if [ "$size" -gt "$MAX_BYTES" ]; then
    echo "staged file exceeds ${MAX_LABEL}: ${file} (${size} bytes)"
    failed=1
  fi
done < <(git diff --cached --name-only --diff-filter=A -z)

exit "$failed"
