# AGENTS.md

This file defines repository-specific working rules for coding agents.

## Scope

These instructions apply to the entire repository unless a deeper `AGENTS.md` overrides them.

## Project Context

- Repository: `magic-recipe`
- Main branch: `main`
- Remote: `origin`
- Stack: React + Vite + TypeScript + Tailwind + Vercel Functions

## Git Rules

### Safety

- Never force-push unless the user explicitly requests it.
- Never push directly to `main` unless the user explicitly requests it.
- Never rewrite existing published history unless the user explicitly requests it.
- Do not amend commits unless the user explicitly requests it.
- Before any push, verify the target branch and remote.

### Branching

- For any non-trivial change, create a branch before committing.
- A change is considered non-trivial if it:
  - changes app behavior
  - touches multiple files
  - changes API behavior
  - affects deployment or configuration
  - should be reviewable independently
- Small documentation-only or note-only changes may stay on the current branch if the user wants that.
- Create a Pull Request after the feature or the change is finished, and let me know so I can go and approve it

### Branch Naming

Use one of these prefixes:

- `feature/<short-slug>`
- `fix/<short-slug>`
- `chore/<short-slug>`
- `docs/<short-slug>`
- `refactor/<short-slug>`

Examples:

- `feature/recipe-generation-ui`
- `fix/vercel-dev-workflow`
- `docs/phase-notes`
- `chore/smoke-test-script`

### Commit Naming

Use Conventional Commit style:

- `feature: ...`
- `fix: ...`
- `chore: ...`
- `docs: ...`
- `refactor: ...`

Examples:

- `feature: add recipe generation UI`
- `fix: improve local API route error message`
- `chore: add API smoke test`
- `docs: add phase 4 notes`

### Commit Granularity

- Prefer one focused commit per completed task.
- Do not mix unrelated changes into one commit.
- If a task has both code and docs directly related to the same change, they may go in one commit.
- Do not open a PR until the full feature is complete, unless explicitly asked.

### Push Policy

- Default workflow:
  1. create branch
  2. implement change
  3. run relevant verification
  4. commit
  5. push branch
- Ask before pushing if the user did not explicitly request a push.
- If the user asks for code changes only, do not assume push permission.

## Verification Before Commit

When relevant, run the smallest reasonable verification before committing:

- `npm run build`
- `npm run lint`
- `npm run smoke:api`

If something cannot be verified, state that clearly in the final summary.

## Collaboration Defaults

- Prefer minimal, reviewable changes.
- Preserve existing user changes.
- Do not revert unrelated work in the repo.
- If Git state is unclear or risky, stop and ask before taking further Git actions.
