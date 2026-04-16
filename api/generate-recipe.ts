import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'

import {
  GenerateRecipeRequestValidationError,
  parseGenerateRecipeRequest,
} from './_lib/generateRecipeRequestSchema.ts'
import { buildMockRecipe } from './_lib/mockRecipe.ts'
import {
  RecipeValidationError,
  parseAndNormalizeRecipe,
  recipeSchema,
} from './_lib/recipeSchema.ts'

const DEFAULT_OPENAI_MODEL = 'gpt-5.4-mini'
const JSON_RESPONSE_HEADERS = {
  'cache-control': 'no-store',
} as const

type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'RATE_LIMIT'
  | 'QUOTA_EXCEEDED'
  | 'UPSTREAM_ERROR'
  | 'INVALID_RESPONSE'
  | 'INTERNAL_ERROR'

type ApiErrorResponse = {
  error: {
    code: ApiErrorCode
    message: string
  }
}

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return Response.json(body, {
    ...init,
    headers: {
      ...JSON_RESPONSE_HEADERS,
      ...Object.fromEntries(new Headers(init?.headers).entries()),
    },
  })
}

function errorResponse(
  status: number,
  code: ApiErrorCode,
  message: string,
  init?: ResponseInit,
): Response {
  const body: ApiErrorResponse = {
    error: {
      code,
      message,
    },
  }

  return jsonResponse(body, {
    ...init,
    status,
  })
}

class ConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigurationError'
  }
}

function isMockRecipeModeEnabled(): boolean {
  return process.env.MOCK_RECIPE_MODE === 'true'
}

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new ConfigurationError('OPENAI_API_KEY is not configured.')
  }

  return new OpenAI({ apiKey })
}

function getOpenAIModel(): string {
  return process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL
}

function buildRecipePrompt(ingredients: string[]): string {
  return [
    'Available ingredients:',
    ...ingredients.map((ingredient) => `- ${ingredient}`),
    '',
    'Use as many of these as reasonable, but not necessarily all of them.',
    'You may assume common pantry staples like salt, pepper, oil, and water.',
    'Return one practical recipe suitable for a home cook.',
    'Keep the recipe concise and useful.',
  ].join('\n')
}

function isQuotaExceededError(
  error: InstanceType<typeof OpenAI.APIError>,
): boolean {
  const errorMessage = error.message.toLocaleLowerCase()

  return (
    error.status === 429 &&
    (error.code === 'insufficient_quota' ||
      error.type === 'insufficient_quota' ||
      errorMessage.includes('exceeded your current quota') ||
      errorMessage.includes('billing') ||
      errorMessage.includes('credits'))
  )
}

async function generateRecipeWithOpenAI(
  ingredients: string[],
): Promise<ReturnType<typeof parseAndNormalizeRecipe>> {
  const client = getOpenAIClient()
  const response = await client.responses.parse({
    model: getOpenAIModel(),
    instructions:
      'You generate a single recipe from the user ingredient list. Return only structured recipe data. Keep the title and description concise. Steps must be actionable and in cooking order. If cook time or difficulty is uncertain, return null for that field.',
    input: buildRecipePrompt(ingredients),
    text: {
      format: zodTextFormat(recipeSchema, 'recipe'),
    },
  })

  if (!response.output_parsed) {
    throw new RecipeValidationError('Recipe response was empty.')
  }

  return parseAndNormalizeRecipe(response.output_parsed)
}

async function createRecipeResponse(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse(
      405,
      'BAD_REQUEST',
      'Only POST requests are supported.',
      {
        headers: {
          allow: 'POST',
        },
      },
    )
  }

  let requestBody: unknown

  try {
    requestBody = (await request.json()) as unknown
  } catch {
    return errorResponse(
      400,
      'BAD_REQUEST',
      'Please send a valid JSON body with an ingredients array.',
    )
  }

  try {
    const { ingredients } = parseGenerateRecipeRequest(requestBody)
    const recipe = isMockRecipeModeEnabled()
      ? buildMockRecipe(ingredients)
      : await generateRecipeWithOpenAI(ingredients)

    return jsonResponse({ recipe }, { status: 200 })
  } catch (error: unknown) {
    if (error instanceof GenerateRecipeRequestValidationError) {
      return errorResponse(400, 'BAD_REQUEST', error.message)
    }

    if (error instanceof RecipeValidationError) {
      return errorResponse(
        502,
        'INVALID_RESPONSE',
        'We could not generate a valid recipe right now. Please try again.',
      )
    }

    if (error instanceof ConfigurationError) {
      console.error('Recipe route configuration error.', error)

      return errorResponse(
        500,
        'INTERNAL_ERROR',
        'Something went wrong on our side. Please try again.',
      )
    }

    if (error instanceof OpenAI.APIError) {
      if (isQuotaExceededError(error)) {
        console.error('OpenAI quota exceeded while generating recipe.', {
          status: error.status,
          code: error.code,
          type: error.type,
          name: error.name,
          requestId: error.requestID,
        })

        return errorResponse(
          429,
          'QUOTA_EXCEEDED',
          'Recipe generation is unavailable for this API project right now. Check API billing and limits, then try again.',
        )
      }

      if (error.status === 429) {
        console.error('OpenAI rate limit while generating recipe.', {
          status: error.status,
          code: error.code,
          type: error.type,
          name: error.name,
          requestId: error.requestID,
        })

        return errorResponse(
          429,
          'RATE_LIMIT',
          'Recipe generation is busy right now. Please wait a moment and try again.',
        )
      }

      if (error.status == null || error.status >= 500) {
        return errorResponse(
          502,
          'UPSTREAM_ERROR',
          'Recipe generation is temporarily unavailable. Please try again.',
        )
      }

      console.error('OpenAI API error while generating recipe.', {
        status: error.status,
        name: error.name,
        requestId: error.requestID,
      })

      return errorResponse(
        500,
        'INTERNAL_ERROR',
        'Something went wrong on our side. Please try again.',
      )
    }

    console.error('Unexpected error while generating recipe.', error)

    return errorResponse(
      500,
      'INTERNAL_ERROR',
      'Something went wrong on our side. Please try again.',
    )
  }
}

export default {
  fetch(request: Request): Promise<Response> {
    return createRecipeResponse(request)
  },
}
