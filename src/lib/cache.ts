import { getIngredientKey } from '../../lib/ingredients.ts'
import type { RecipeCache, CachedRecipe } from '../types/cache.ts'
import type { Recipe } from '../types/recipe.ts'

export const RECIPE_CACHE_STORAGE_KEY = 'magic-recipe.cache'

function isStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

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

  return (
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    (value.cookTimeMinutes === null ||
      (typeof value.cookTimeMinutes === 'number' &&
        Number.isInteger(value.cookTimeMinutes))) &&
    (value.difficulty === null ||
      value.difficulty === 'easy' ||
      value.difficulty === 'medium' ||
      value.difficulty === 'hard') &&
    isStringArray(value.ingredients) &&
    isStringArray(value.steps)
  )
}

function isCachedRecipe(value: unknown): value is CachedRecipe {
  return (
    isObject(value) &&
    typeof value.key === 'string' &&
    typeof value.cachedAt === 'string' &&
    isRecipe(value.recipe)
  )
}

export function getRecipeCacheKey(ingredients: string[]): string {
  return ingredients
    .map(getIngredientKey)
    .sort()
    .join('::')
}

export function createCachedRecipe(
  ingredients: string[],
  recipe: Recipe,
): CachedRecipe {
  return {
    key: getRecipeCacheKey(ingredients),
    recipe,
    cachedAt: new Date().toISOString(),
  }
}

export function loadRecipeCache(): RecipeCache {
  if (!isStorageAvailable()) {
    return {}
  }

  try {
    const rawValue = window.localStorage.getItem(RECIPE_CACHE_STORAGE_KEY)

    if (!rawValue) {
      return {}
    }

    const parsedValue: unknown = JSON.parse(rawValue)

    if (!isObject(parsedValue)) {
      return {}
    }

    return Object.fromEntries(
      Object.entries(parsedValue).filter(([, value]) => isCachedRecipe(value)),
    ) as RecipeCache
  } catch {
    return {}
  }
}

export function saveRecipeCache(cache: RecipeCache): boolean {
  if (!isStorageAvailable()) {
    return false
  }

  try {
    window.localStorage.setItem(RECIPE_CACHE_STORAGE_KEY, JSON.stringify(cache))
    return true
  } catch {
    return false
  }
}
