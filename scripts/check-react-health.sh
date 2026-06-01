#!/bin/bash
# Check React codebase health using react-doctor.
# Fails the build/commit if the health score falls below a specified threshold.
set -e

# Configuration
THRESHOLD=${REACT_DOCTOR_THRESHOLD:-95}
PROJECT_DIR="frontend"

echo "Checking React health score (Minimum threshold: $THRESHOLD)..."

# Ensure we run from the project root and the target folder exists
if [ ! -d "$PROJECT_DIR" ]; then
  echo "❌ Error: Project directory '$PROJECT_DIR' not found."
  exit 1
fi

cd "$PROJECT_DIR"

# Check if react-doctor is installed/available
if ! bunx react-doctor --version &>/dev/null; then
  echo "❌ Error: react-doctor is not available. Please ensure bun is installed."
  exit 1
fi

# Run react-doctor with --score to get the numeric score
# Pass any extra arguments (like --staged) to this script
SCORE=$(bunx react-doctor --score "$@")

# If no score was returned (e.g., no staged files were checked), exit early
if [ -z "$SCORE" ]; then
  echo "✔ No files to check or score could not be determined."
  exit 0
fi

# Compare the score with the threshold
if [ "$SCORE" -lt "$THRESHOLD" ]; then
  echo "❌ Error: React health score is $SCORE, which is below the threshold of $THRESHOLD!"
  echo ""
  echo "========================================= ACTION REQUIRED ========================================="
  echo "Your React changes introduced health issues or code smells. Please follow these steps:"
  echo ""
  echo "1. View detailed issues:"
  echo "   Run the following command in the 'frontend' folder to view the exact violations:"
  echo "     cd frontend && bunx react-doctor --staged --verbose"
  echo ""
  echo "2. Reference coding standards:"
  echo "   Refer to the React development guidelines in '.agent/rules/react-rules.md' to fix the violations."
  echo ""
  echo "3. Inline disables (If false positive):"
  echo "   If a warning is a false positive, you can suppress it using inline comments such as:"
  echo "     // react-doctor-disable-next-line <rule-id>"
  echo ""
  echo "4. Temporary bypass (⚠️ STRICTLY CAUTIONED):"
  echo "   Bypassing health checks can introduce tech debt and violates codebase quality guidelines."
  echo "   You MUST ask the project owner/USER for explicit approval before bypassing."
  echo "   If approved, you may bypass the hooks using:"
  echo "     LEFTHOOK=0 git commit -m \"...\""
  echo "==================================================================================================="
  exit 1
fi

echo "✔ React health check passed with score: $SCORE/100"
exit 0
