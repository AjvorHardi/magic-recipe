import {
  MAX_INGREDIENTS,
  MIN_INGREDIENTS,
  getIngredientKey,
  normalizeIngredient,
} from '../../lib/ingredients.ts'
import { z } from 'zod'

const generateRecipeRequestSchema = z.object({
  ingredients: z.array(z.string()),
})

export type GenerateRecipeRequestInput = z.infer<
  typeof generateRecipeRequestSchema
>

export class GenerateRecipeRequestValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GenerateRecipeRequestValidationError'
  }
}

export function parseGenerateRecipeRequest(
  payload: unknown,
): GenerateRecipeRequestInput {
  const parsedRequest = generateRecipeRequestSchema.safeParse(payload)

  if (!parsedRequest.success) {
    throw new GenerateRecipeRequestValidationError(
      'Request body must include an ingredients array.',
    )
  }

  const ingredients = parsedRequest.data.ingredients.map(normalizeIngredient)

  if (ingredients.some((ingredient) => !ingredient)) {
    throw new GenerateRecipeRequestValidationError(
      'Ingredients must be non-empty strings.',
    )
  }

  const seenIngredientKeys = new Set<string>()

  for (const ingredient of ingredients) {
    const ingredientKey = getIngredientKey(ingredient)

    if (seenIngredientKeys.has(ingredientKey)) {
      throw new GenerateRecipeRequestValidationError(
        'Duplicate ingredients are not allowed.',
      )
    }

    seenIngredientKeys.add(ingredientKey)
  }

  if (ingredients.length < MIN_INGREDIENTS) {
    throw new GenerateRecipeRequestValidationError(
      `At least ${MIN_INGREDIENTS} ingredients are required.`,
    )
  }

  if (ingredients.length > MAX_INGREDIENTS) {
    throw new GenerateRecipeRequestValidationError(
      `A maximum of ${MAX_INGREDIENTS} ingredients is allowed.`,
    )
  }

  return {
    ingredients,
  }
}
