import type { Recipe } from '../types/recipe.ts'

import { RecipeSteps } from './RecipeSteps.tsx'

type RecipeCardProps = {
  recipe: Recipe
  isBookmarked: boolean
  onToggleBookmark: () => void
}

function formatDifficulty(difficulty: Recipe['difficulty']): string {
  if (!difficulty) {
    return 'Flexible'
  }

  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
}

function formatCookTime(cookTimeMinutes: Recipe['cookTimeMinutes']): string {
  if (cookTimeMinutes === null) {
    return 'Unspecified'
  }

  return `${cookTimeMinutes} min`
}

export function RecipeCard({
  recipe,
  isBookmarked,
  onToggleBookmark,
}: RecipeCardProps) {
  return (
    <section className="rounded-[2rem] border border-stone-800 bg-stone-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur sm:p-8">
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_15rem]">
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">
                Your recipe
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl">
                {recipe.title}
              </h2>
              <p className="max-w-2xl text-base leading-7 text-stone-300">
                {recipe.description}
              </p>
            </div>

            <button
              type="button"
              onClick={onToggleBookmark}
              className="inline-flex items-center justify-center rounded-2xl border border-amber-300/30 bg-stone-900/70 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:border-amber-300/60 hover:bg-stone-900"
            >
              {isBookmarked ? 'Remove bookmark' : 'Save recipe'}
            </button>
          </div>

          <dl className="grid gap-4 rounded-[1.5rem] border border-stone-800 bg-stone-900/60 p-5">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                Cook time
              </dt>
              <dd className="mt-1 text-lg font-semibold text-stone-100">
                {formatCookTime(recipe.cookTimeMinutes)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                Difficulty
              </dt>
              <dd className="mt-1 text-lg font-semibold text-stone-100">
                {formatDifficulty(recipe.difficulty)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
            Ingredients used
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {recipe.ingredients.map((ingredient) => (
              <li
                key={ingredient}
                className="rounded-2xl border border-stone-800 bg-stone-900/70 px-4 py-3 text-sm text-stone-200"
              >
                {ingredient}
              </li>
            ))}
          </ul>
        </div>

        <RecipeSteps steps={recipe.steps} />
      </div>
    </section>
  )
}
