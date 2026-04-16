import type { BookmarkedRecipe } from '../types/bookmarks.ts'
import type { Recipe } from '../types/recipe.ts'

type BookmarksListProps = {
  bookmarks: BookmarkedRecipe[]
  activeBookmarkId: string | null
  onOpenBookmark: (bookmark: BookmarkedRecipe) => void
  onRemoveBookmark: (bookmark: BookmarkedRecipe) => void
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

export function BookmarksList({
  bookmarks,
  activeBookmarkId,
  onOpenBookmark,
  onRemoveBookmark,
}: BookmarksListProps) {
  return (
    <section className="rounded-[2rem] border border-stone-800 bg-stone-950/65 p-6 backdrop-blur sm:p-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">
          Bookmarks
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-50">
          Saved recipes
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-stone-300">
          Keep favorite recipes on this device and reopen them anytime.
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="mt-6 rounded-[1.75rem] border border-dashed border-stone-700 bg-stone-950/35 px-5 py-6 text-sm leading-6 text-stone-400">
          No saved recipes yet. Generate one recipe and save it here.
        </div>
      ) : (
        <ul className="mt-6 grid gap-4">
          {bookmarks.map((bookmark) => {
            const isActive = bookmark.id === activeBookmarkId

            return (
              <li
                key={bookmark.id}
                className="rounded-[1.75rem] border border-stone-800 bg-stone-900/70 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold text-stone-50">
                        {bookmark.recipe.title}
                      </h3>
                      {isActive ? (
                        <span className="rounded-full border border-amber-200/30 bg-amber-300/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                          Active
                        </span>
                      ) : null}
                    </div>
                    <p className="max-w-2xl text-sm leading-6 text-stone-300">
                      {bookmark.recipe.description}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
                      <span>Cook time: {formatCookTime(bookmark.recipe.cookTimeMinutes)}</span>
                      <span>Difficulty: {formatDifficulty(bookmark.recipe.difficulty)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => onOpenBookmark(bookmark)}
                      className="rounded-2xl border border-amber-300/40 bg-amber-200 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-100"
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveBookmark(bookmark)}
                      className="rounded-2xl border border-stone-700 bg-stone-950/80 px-4 py-2 text-sm font-semibold text-stone-100 transition hover:border-rose-300/40 hover:text-rose-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
