Typecheck, test, commit, and push.

1. Run `npm run typecheck` — stop if it fails.
2. Run `npm run test:server` — stop if any test fails.
3. Run `npm run test:integration` — stop if any test fails.
4. Run `npm run test:client` — stop if any test fails.
5. If all pass, stage the relevant files, write a commit message following the repo's style (short summary line, optional body explaining why), and commit.
6. Push to the remote.
7. Report: test counts, commit hash, and what was pushed.

If any step fails, stop and report what went wrong — do not commit or push broken code.

$ARGUMENTS
