#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "🔍 Running static security scan using Semgrep..."
uv run --project backend semgrep scan \
  --config p/default \
  --config p/python \
  --config p/fastapi \
  --config p/typescript \
  --config p/react \
  --config p/dockerfile \
  --error \
  "$@"
