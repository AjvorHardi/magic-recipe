
import { useEffect, useState } from 'react'

import {
  MAX_INGREDIENTS,
  MIN_INGREDIENTS,
  type IngredientAddIssue,
  isIngredientCountValid,
  validateIngredientForAdd,
} from '../lib/ingredients.ts'
import {
  createCachedRecipe,
  getRecipeCacheKey,
  loadRecipeCache,
  saveRecipeCache,
} from './lib/cache.ts'
import {
  createBookmarkedRecipe,
  getBookmarkedRecipeId,
  loadBookmarks,
  saveBookmarks,
} from './lib/bookmarks.ts'
import { BookmarksList } from './components/BookmarksList.tsx'
import { IngredientForm } from './components/IngredientForm.tsx'
import { IngredientList } from './components/IngredientList.tsx'
import { RecipeCard } from './components/RecipeCard.tsx'
import { generateRecipe } from './lib/api.ts'
import type { RecipeCache } from './types/cache.ts'
import type { BookmarkedRecipe } from './types/bookmarks.ts'
import type { Recipe } from './types/recipe.ts'

function getAddIngredientErrorMessage(issue: IngredientAddIssue): string {
  switch (issue) {
    case 'EMPTY':
      return 'Enter an ingredient before adding it.'
    case 'DUPLICATE':
      return 'That ingredient is already on the list.'
    case 'MAX_INGREDIENTS_REACHED':
      return `You can add up to ${MAX_INGREDIENTS} ingredients.`
    default:
      return 'That ingredient could not be added.'
  }
}

function App() {
  const [ingredientInput, setIngredientInput] = useState('')
  const [ingredients, setIngredients] = useState<string[]>([])
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [recipeCache, setRecipeCache] = useState<RecipeCache>({})
  const [bookmarks, setBookmarks] = useState<BookmarkedRecipe[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [bookmarkMessage, setBookmarkMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setRecipeCache(loadRecipeCache())
  }, [])

  useEffect(() => {
    setBookmarks(loadBookmarks())
  }, [])

  const activeBookmarkId = recipe ? getBookmarkedRecipeId(recipe) : null
  const isActiveRecipeBookmarked =
    activeBookmarkId !== null &&
    bookmarks.some((bookmark) => bookmark.id === activeBookmarkId)

  function persistBookmarks(
    nextBookmarks: BookmarkedRecipe[],
    failureMessage: string,
  ): boolean {
    const didSave = saveBookmarks(nextBookmarks)

    if (!didSave) {
      setBookmarkMessage(failureMessage)
      return false
    }

    setBookmarks(nextBookmarks)
    setBookmarkMessage(null)
    return true
  }

  function handleAddIngredient() {
    const result = validateIngredientForAdd(ingredients, ingredientInput)

    if (!result.ok) {
      setErrorMessage(getAddIngredientErrorMessage(result.issue))
      return
    }

    setIngredients((currentIngredients) => [...currentIngredients, result.ingredient])
    setIngredientInput('')
    setErrorMessage(null)
    setBookmarkMessage(null)
  }

  function handleRemoveIngredient(ingredientToRemove: string) {
    setIngredients((currentIngredients) =>
      currentIngredients.filter((ingredient) => ingredient !== ingredientToRemove),
    )
    setErrorMessage(null)
    setBookmarkMessage(null)
  }

  function handleToggleBookmark() {
    if (!recipe) {
      return
    }

    const recipeId = getBookmarkedRecipeId(recipe)
    const existingBookmark = bookmarks.find((bookmark) => bookmark.id === recipeId)

    if (existingBookmark) {
      const nextBookmarks = bookmarks.filter((bookmark) => bookmark.id !== recipeId)

      persistBookmarks(
        nextBookmarks,
        'This bookmark could not be removed on this device right now.',
      )

      return
    }

    const nextBookmarks = [createBookmarkedRecipe(recipe), ...bookmarks]

    persistBookmarks(
      nextBookmarks,
      'This recipe could not be bookmarked on this device right now.',
    )
  }

  function handleOpenBookmark(bookmark: BookmarkedRecipe) {
    setRecipe(bookmark.recipe)
    setErrorMessage(null)
    setBookmarkMessage(null)
  }

  function handleRemoveBookmark(bookmarkToRemove: BookmarkedRecipe) {
    const nextBookmarks = bookmarks.filter(
      (bookmark) => bookmark.id !== bookmarkToRemove.id,
    )

    persistBookmarks(
      nextBookmarks,
      'This bookmark could not be removed on this device right now.',
    )
  }

  async function handleSubmit() {
    if (isLoading) {
      return
    }

    if (!isIngredientCountValid(ingredients)) {
      setErrorMessage(
        `Add between ${MIN_INGREDIENTS} and ${MAX_INGREDIENTS} ingredients before generating a recipe.`,
      )
      return
    }

    const cacheKey = getRecipeCacheKey(ingredients)
    const cachedRecipe = recipeCache[cacheKey]

    if (cachedRecipe) {
      setErrorMessage(null)
      setRecipe(cachedRecipe.recipe)
      return
    }

    setIsLoading(true)
    setErrorMessage(null)
    setRecipe(null)

    try {
      const nextRecipe = await generateRecipe({ ingredients })
      const nextCache = {
        ...recipeCache,
        [cacheKey]: createCachedRecipe(ingredients, nextRecipe),
      }

      saveRecipeCache(nextCache)
      setRecipeCache(nextCache)
      setRecipe(nextRecipe)
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Recipe generation failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-8 text-stone-50 sm:px-6 sm:py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 lg:gap-8">
        <IngredientForm
          ingredientInput={ingredientInput}
          ingredientsCount={ingredients.length}
          isLoading={isLoading}
          onInputChange={(value) => {
            setIngredientInput(value)
            setErrorMessage(null)
          }}
          onAddIngredient={handleAddIngredient}
          onSubmit={handleSubmit}
        />

        <section className="rounded-[2rem] border border-stone-800 bg-stone-950/65 p-5 backdrop-blur sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-400">
                Ingredient list
              </p>
              <p className="mt-1 text-sm text-stone-300">
                Remove any ingredient with the x button.
              </p>
            </div>
          </div>

          <IngredientList
            ingredients={ingredients}
            onRemoveIngredient={handleRemoveIngredient}
          />
        </section>

        {errorMessage ? (
          <section className="rounded-[1.75rem] border border-rose-300/20 bg-rose-950/40 px-5 py-4 text-sm leading-6 text-rose-100">
            {errorMessage}
          </section>
        ) : null}

        {bookmarkMessage ? (
          <section className="rounded-[1.75rem] border border-amber-300/20 bg-amber-950/25 px-5 py-4 text-sm leading-6 text-amber-100">
            {bookmarkMessage}
          </section>
        ) : null}

        {isLoading ? (
          <section className="rounded-[2rem] border border-stone-800 bg-stone-950/65 p-6 backdrop-blur sm:p-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">
                Brewing
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-stone-50">
                Building a recipe from your ingredients...
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-stone-300">
                The submit button is locked until this request finishes so the app
                does not send duplicate generations.
              </p>
            </div>
          </section>
        ) : null}

        {recipe ? (
          <RecipeCard
            recipe={recipe}
            isBookmarked={isActiveRecipeBookmarked}
            onToggleBookmark={handleToggleBookmark}
          />
        ) : !isLoading ? (
          <section className="rounded-[2rem] border border-dashed border-stone-700 bg-stone-950/35 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-400">
              Result
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-100">
              Your generated recipe will appear here.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-400">
              Start with at least two ingredients, then press Do magic.
            </p>
          </section>
        ) : null}

        <BookmarksList
          bookmarks={bookmarks}
          activeBookmarkId={activeBookmarkId}
          onOpenBookmark={handleOpenBookmark}
          onRemoveBookmark={handleRemoveBookmark}
        />
      </div>
    </main>
  )
}

export default App
