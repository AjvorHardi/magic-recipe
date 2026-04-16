import type { Recipe } from './recipe.ts'

export type BookmarkedRecipe = {
  id: string
  recipe: Recipe
  savedAt: string
}
