#!/bin/bash
# Remind to update docs if source files changed but CLAUDE.md/README.md didn't
cd "$CLAUDE_PROJECT_DIR" || exit 0

CHANGED=$(git diff --name-only HEAD 2>/dev/null)
[ -z "$CHANGED" ] && exit 0

HAS_SOURCE=$(echo "$CHANGED" | grep -E '\.(ts|tsx)$' | head -1)
HAS_DOCS=$(echo "$CHANGED" | grep -E '^(CLAUDE|README)\.md$' | head -1)

if [ -n "$HAS_SOURCE" ] && [ -z "$HAS_DOCS" ]; then
  echo '{"systemMessage":"Source files changed but CLAUDE.md and README.md were not updated. Consider updating them before committing."}'
fi
