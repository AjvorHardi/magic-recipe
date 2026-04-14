export const MIN_INGREDIENTS = 2
export const MAX_INGREDIENTS = 15

const WHITESPACE_PATTERN = /\s+/g

export type IngredientAddIssue =
  | 'EMPTY'
  | 'DUPLICATE'
  | 'MAX_INGREDIENTS_REACHED'

export type IngredientAddResult =
  | { ok: true; ingredient: string }
  | { ok: false; issue: IngredientAddIssue }

export function normalizeIngredient(input: string): string {
  return input.trim().replace(WHITESPACE_PATTERN, ' ')
}

export function getIngredientKey(input: string): string {
  return normalizeIngredient(input).toLocaleLowerCase()
}

export function dedupeIngredients(inputs: string[]): string[] {
  const uniqueIngredients: string[] = []
  const seenKeys = new Set<string>()

  for (const input of inputs) {
    const normalizedIngredient = normalizeIngredient(input)

    if (!normalizedIngredient) {
      continue
    }

    const ingredientKey = normalizedIngredient.toLocaleLowerCase()

    if (seenKeys.has(ingredientKey)) {
      continue
    }

    seenKeys.add(ingredientKey)
    uniqueIngredients.push(normalizedIngredient)
  }

  return uniqueIngredients
}

export function validateIngredientForAdd(
  currentIngredients: string[],
  rawIngredient: string,
): IngredientAddResult {
  const normalizedIngredient = normalizeIngredient(rawIngredient)

  if (!normalizedIngredient) {
    return {
      ok: false,
      issue: 'EMPTY',
    }
  }

  if (currentIngredients.length >= MAX_INGREDIENTS) {
    return {
      ok: false,
      issue: 'MAX_INGREDIENTS_REACHED',
    }
  }

  const ingredientKey = normalizedIngredient.toLocaleLowerCase()
  const hasDuplicate = currentIngredients.some(
    (ingredient) => getIngredientKey(ingredient) === ingredientKey,
  )

  if (hasDuplicate) {
    return {
      ok: false,
      issue: 'DUPLICATE',
    }
  }

  return {
    ok: true,
    ingredient: normalizedIngredient,
  }
}

export function isIngredientCountValid(ingredients: string[]): boolean {
  return (
    ingredients.length >= MIN_INGREDIENTS &&
    ingredients.length <= MAX_INGREDIENTS
  )
}
