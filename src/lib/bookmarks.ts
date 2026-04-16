import type { BookmarkedRecipe } from '../types/bookmarks.ts'
import type { Recipe } from '../types/recipe.ts'

export const BOOKMARKS_STORAGE_KEY = 'magic-recipe.bookmarks'

const WHITESPACE_PATTERN = /\s+/g

function normalizeText(value: string): string {
  return value.trim().replace(WHITESPACE_PATTERN, ' ').toLocaleLowerCase()
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

function isBookmarkedRecipe(value: unknown): value is BookmarkedRecipe {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.savedAt === 'string' &&
    isRecipe(value.recipe)
  )
}

function hashText(value: string): string {
  let hash = 5381

  for (const character of value) {
    hash = (hash * 33) ^ character.charCodeAt(0)
  }

  return Math.abs(hash).toString(36)
}

function getRecipeFingerprint(recipe: Recipe): string {
  return [
    normalizeText(recipe.title),
    normalizeText(recipe.description),
    recipe.cookTimeMinutes === null ? 'null' : String(recipe.cookTimeMinutes),
    recipe.difficulty ?? 'null',
    recipe.ingredients.map(normalizeText).join('|'),
    recipe.steps.map(normalizeText).join('|'),
  ].join('::')
}

function isStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function getBookmarkedRecipeId(recipe: Recipe): string {
  return `bookmark_${hashText(getRecipeFingerprint(recipe))}`
}

export function createBookmarkedRecipe(recipe: Recipe): BookmarkedRecipe {
  return {
    id: getBookmarkedRecipeId(recipe),
    recipe,
    savedAt: new Date().toISOString(),
  }
}

export function loadBookmarks(): BookmarkedRecipe[] {
  if (!isStorageAvailable()) {
    return []
  }

  try {
    const rawValue = window.localStorage.getItem(BOOKMARKS_STORAGE_KEY)

    if (!rawValue) {
      return []
    }

    const parsedValue: unknown = JSON.parse(rawValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.filter(isBookmarkedRecipe).sort((left, right) => {
      return right.savedAt.localeCompare(left.savedAt)
    })
  } catch {
    return []
  }
}

export function saveBookmarks(bookmarks: BookmarkedRecipe[]): boolean {
  if (!isStorageAvailable()) {
    return false
  }

  try {
    window.localStorage.setItem(
      BOOKMARKS_STORAGE_KEY,
      JSON.stringify(bookmarks),
    )

    return true
  } catch {
    return false
  }
}
