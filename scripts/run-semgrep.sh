#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

# Uses backend venv to run Semgrep without global installation.
# Scans all folders (backend, frontend, infra) starting from the execution directory.
echo "🔍 Running static security scan using Semgrep..."
if command -v uv &> /dev/null; then
  uv run --project backend semgrep scan \
    --config p/default \
    --config p/python \
    --config p/fastapi \
    --config p/typescript \
    --config p/react \
    --config p/dockerfile \
    --error \
    "$@"
else
  semgrep scan \
    --config p/default \
    --config p/python \
    --config p/fastapi \
    --config p/typescript \
    --config p/react \
    --config p/dockerfile \
    --error \
    "$@"
fi
