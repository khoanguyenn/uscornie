#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

# NOTE: We run Semgrep using the virtual environment configured in the 'backend' folder
# (to avoid requiring a global installation), but it scans the entire monorepo
# (all folders: backend, frontend, infra) starting from the directory where the command is executed.
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
