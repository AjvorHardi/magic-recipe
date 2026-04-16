# Magic Recipe

Magic Recipe is a web app that suggests a recipe from a user's ingredient list using OpenAI.

Current client-side features:

- ingredient entry with trim and duplicate prevention
- recipe generation through one Vercel API route
- local recipe caching for repeated ingredient combinations
- mock recipe mode for local development
- saved recipe bookmarks with `localStorage`
- distinct UI handling for rate limits, quota issues, upstream failures, and invalid AI responses

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- One Vercel serverless function
- OpenAI for recipe generation

## Current Status

Phase 0 through Phase 7 are complete:

- baseline cleanup
- contract and validation setup
- backend API route
- frontend single-page MVP
- deploy-readiness and smoke-test pass
- bookmark saved recipes locally and reopen them later
- cache repeated ingredient combinations locally to avoid duplicate AI requests
- harden API failure handling for rate limits, quota issues, and invalid responses

## Environment Variables

Copy `.env.example` to `.env` for local development.

- `OPENAI_API_KEY`: OpenAI API key used only by the server function
- `MOCK_RECIPE_MODE`: set to `true` to bypass OpenAI and return a fake recipe during development
- `OPENAI_MODEL`: optional override for the model used by the server route

Do not expose server secrets with a `VITE_` prefix.

## Commands

```bash
npm run dev
npm run dev:vercel
npm run build
npm run lint
npm run smoke:api
```

`npm run dev` starts the frontend-only Vite dev server.

`npm run dev:vercel` starts local development through `vercel dev`, so both the Vite frontend and the `api/` route are available.

`npm run smoke:api` runs a local mock-mode smoke test directly against the route handler without needing a server.

## Local Testing

Recommended full-stack local workflow:

1. Copy `.env.example` to `.env`
2. Use `MOCK_RECIPE_MODE=true` for the first pass
3. Run `npm run dev:vercel`
4. Open the local URL printed by Vercel
5. Add at least two ingredients and click `Do magic`
6. Repeat the same ingredient combination in a different order and confirm it loads from cache
7. Save a recipe bookmark and refresh the page to confirm it persists

Recommended quick verification commands:

```bash
npm run build
npm run lint
npm run smoke:api
```

If the browser shows `Recipe API route was not found`, you likely started `npm run dev` instead of `npm run dev:vercel`.

Error behavior now distinguishes:

- retryable rate limits
- API quota / billing exhaustion
- upstream provider failures
- invalid AI response payloads
- unreadable or missing local API responses

## Deploying To Vercel

1. Create or link the project with the Vercel CLI:

```bash
npx vercel
```

2. Add the required environment variables in Vercel:

- `OPENAI_API_KEY`
- `MOCK_RECIPE_MODE`
- `OPENAI_MODEL`

Recommended production values:
- `MOCK_RECIPE_MODE=false`
- `OPENAI_MODEL=gpt-5.4-mini`

3. Deploy:

```bash
npx vercel --prod
```

4. Smoke-test the deployed app:
- open the production URL
- add 2 to 4 ingredients
- generate a recipe
- repeat the same ingredient combination and confirm it loads quickly from cache
- save and reopen a bookmark
- verify the result card, error handling, expandable steps, and bookmark persistence

## API

- `POST /api/generate-recipe`

Request body:

```json
{
  "ingredients": ["tomato", "garlic"]
}
```

Response body:

```json
{
  "recipe": {
    "title": "Example Recipe",
    "description": "Short summary",
    "cookTimeMinutes": 25,
    "difficulty": "easy",
    "ingredients": ["tomato", "garlic"],
    "steps": ["Step one", "Step two"]
  }
}
```
