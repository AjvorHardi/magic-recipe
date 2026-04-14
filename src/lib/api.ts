import type {
  GenerateRecipeErrorResponse,
  GenerateRecipeRequest,
  GenerateRecipeResponse,
  GenerateRecipeSuccessResponse,
} from '../types/api.ts'
import type { Recipe } from '../types/recipe.ts'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isRecipe(value: unknown): value is Recipe {
  if (!isObject(value)) {
    return false
  }

  const difficulty = value.difficulty

  return (
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    (value.cookTimeMinutes === null ||
      (typeof value.cookTimeMinutes === 'number' &&
        Number.isInteger(value.cookTimeMinutes))) &&
    (difficulty === null ||
      difficulty === 'easy' ||
      difficulty === 'medium' ||
      difficulty === 'hard') &&
    isStringArray(value.ingredients) &&
    isStringArray(value.steps)
  )
}

function isGenerateRecipeSuccessResponse(
  value: unknown,
): value is GenerateRecipeSuccessResponse {
  return isObject(value) && isRecipe(value.recipe)
}

function isGenerateRecipeErrorResponse(
  value: unknown,
): value is GenerateRecipeErrorResponse {
  return (
    isObject(value) &&
    isObject(value.error) &&
    typeof value.error.code === 'string' &&
    typeof value.error.message === 'string'
  )
}

export async function generateRecipe(
  payload: GenerateRecipeRequest,
): Promise<Recipe> {
  let response: Response

  try {
    response = await fetch('/api/generate-recipe', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error(
      'We could not reach the recipe service. Check your connection and try again.',
    )
  }

  let data: unknown

  const contentType = response.headers.get('content-type') || ''

  if (!contentType.includes('application/json')) {
    if (response.status === 404) {
      throw new Error(
        'Recipe API route was not found. For full local testing, start the app with npm run dev:vercel.',
      )
    }

    throw new Error('The server returned an unreadable response. Please try again.')
  }

  try {
    data = (await response.json()) as GenerateRecipeResponse
  } catch {
    throw new Error('The server returned an unreadable response. Please try again.')
  }

  if (!response.ok) {
    if (isGenerateRecipeErrorResponse(data)) {
      throw new Error(data.error.message)
    }

    throw new Error('Recipe generation failed. Please try again.')
  }

  if (!isGenerateRecipeSuccessResponse(data)) {
    throw new Error(
      'We received an unexpected recipe format from the server. Please try again.',
    )
  }

  return data.recipe
}
