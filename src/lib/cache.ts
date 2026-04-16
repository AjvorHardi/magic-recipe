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

    return parsedValue as RecipeCache
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
