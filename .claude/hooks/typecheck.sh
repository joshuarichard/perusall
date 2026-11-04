#!/bin/bash
# Full project typecheck gate — runs on Stop to catch errors before finishing
cd "$CLAUDE_PROJECT_DIR/client" && npx tsc --noEmit 2>&1; CLIENT=$?
cd "$CLAUDE_PROJECT_DIR/server" && npx tsc --noEmit 2>&1; SERVER=$?

if [ $CLIENT -ne 0 ] || [ $SERVER -ne 0 ]; then
  echo '{"decision":"block","reason":"TypeScript type errors found — fix before finishing"}'
else
  echo '{"systemMessage":"Typecheck passed"}'
fi
