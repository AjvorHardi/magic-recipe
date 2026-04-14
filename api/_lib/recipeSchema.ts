import { dedupeIngredients } from '../../lib/ingredients.ts'
import { z } from 'zod'

const WHITESPACE_PATTERN = /\s+/g

function normalizeText(value: string): string {
  return value.trim().replace(WHITESPACE_PATTERN, ' ')
}

const normalizedStringSchema = z.string().trim().min(1)

export const recipeSchema = z.object({
  title: normalizedStringSchema,
  description: normalizedStringSchema,
  cookTimeMinutes: z.number().int().min(1).nullable(),
  difficulty: z.enum(['easy', 'medium', 'hard']).nullable(),
  ingredients: z.array(normalizedStringSchema).min(1),
  steps: z.array(normalizedStringSchema).min(1),
})

export type NormalizedRecipe = z.infer<typeof recipeSchema>

export class RecipeValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RecipeValidationError'
  }
}

function normalizeRecipe(recipe: NormalizedRecipe): NormalizedRecipe {
  return {
    title: normalizeText(recipe.title),
    description: normalizeText(recipe.description),
    cookTimeMinutes: recipe.cookTimeMinutes,
    difficulty: recipe.difficulty,
    ingredients: dedupeIngredients(recipe.ingredients),
    steps: recipe.steps.map(normalizeText).filter(Boolean),
  }
}

export function parseAndNormalizeRecipe(payload: unknown): NormalizedRecipe {
  const parsedRecipe = recipeSchema.safeParse(payload)

  if (!parsedRecipe.success) {
    throw new RecipeValidationError(
      'Recipe response did not match the expected shape.',
    )
  }

  const normalizedRecipe = normalizeRecipe(parsedRecipe.data)
  const validatedNormalizedRecipe = recipeSchema.safeParse(normalizedRecipe)

  if (!validatedNormalizedRecipe.success) {
    throw new RecipeValidationError(
      'Recipe response could not be normalized safely.',
    )
  }

  return validatedNormalizedRecipe.data
}

export function parseRecipeJson(payload: string): NormalizedRecipe {
  let parsedPayload: unknown

  try {
    parsedPayload = JSON.parse(payload) as unknown
  } catch {
    throw new RecipeValidationError('Recipe response was not valid JSON.')
  }

  return parseAndNormalizeRecipe(parsedPayload)
}
