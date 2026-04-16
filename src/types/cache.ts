import type { Recipe } from './recipe.ts'

export type CachedRecipe = {
  key: string
  recipe: Recipe
  cachedAt: string
}

export type RecipeCache = Record<string, CachedRecipe>
