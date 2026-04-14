export const RECIPE_DIFFICULTIES = ['easy', 'medium', 'hard'] as const

export type RecipeDifficulty = (typeof RECIPE_DIFFICULTIES)[number]

export type Recipe = {
  title: string
  description: string
  cookTimeMinutes: number | null
  difficulty: RecipeDifficulty | null
  ingredients: string[]
  steps: string[]
}
