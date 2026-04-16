import type { Recipe } from './recipe.ts'

export type GenerateRecipeRequest = {
  ingredients: string[]
}

export type GenerateRecipeErrorCode =
  | 'BAD_REQUEST'
  | 'RATE_LIMIT'
  | 'QUOTA_EXCEEDED'
  | 'UPSTREAM_ERROR'
  | 'INVALID_RESPONSE'
  | 'INTERNAL_ERROR'

export type GenerateRecipeSuccessResponse = {
  recipe: Recipe
}

export type GenerateRecipeErrorResponse = {
  error: {
    code: GenerateRecipeErrorCode
    message: string
  }
}

export type GenerateRecipeResponse =
  | GenerateRecipeSuccessResponse
  | GenerateRecipeErrorResponse
