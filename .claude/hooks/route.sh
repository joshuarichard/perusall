#!/bin/bash
# Routes quality checks to the correct hook based on file path
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

case "$FILE" in
  */client/*) echo "$INPUT" | node "$CLAUDE_PROJECT_DIR/.claude/hooks/react-app/quality-check.js" ;;
  */server/*) echo "$INPUT" | node "$CLAUDE_PROJECT_DIR/.claude/hooks/node-typescript/quality-check.js" ;;
esac
