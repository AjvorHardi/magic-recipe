import { parseAndNormalizeRecipe, type NormalizedRecipe } from './recipeSchema.ts'

export function buildMockRecipe(ingredients: string[]): NormalizedRecipe {
  const primaryIngredients = ingredients.slice(0, 4)
  const featuredIngredients = primaryIngredients.join(', ')
  const titleIngredients = primaryIngredients.slice(0, 2).join(' & ')

  return parseAndNormalizeRecipe({
    title: `${titleIngredients} skillet`,
    description: `A quick mock recipe built around ${featuredIngredients}.`,
    cookTimeMinutes: 25,
    difficulty: 'easy',
    ingredients: primaryIngredients,
    steps: [
      `Prep the ${featuredIngredients} and keep salt, pepper, oil, and water nearby.`,
      `Cook the sturdier ingredients first, then add the quicker-cooking ones.`,
      'Season to taste and add a splash of water if the pan needs loosening.',
      'Serve warm once the ingredients are tender and the flavors have come together.',
    ],
  })
}
