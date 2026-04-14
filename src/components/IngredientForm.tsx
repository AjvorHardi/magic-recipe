type IngredientFormProps = {
  ingredientInput: string
  ingredientsCount: number
  isLoading: boolean
  onInputChange: (value: string) => void
  onAddIngredient: () => void
  onSubmit: () => void
}

export function IngredientForm({
  ingredientInput,
  ingredientsCount,
  isLoading,
  onInputChange,
  onAddIngredient,
  onSubmit,
}: IngredientFormProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-amber-200/20 bg-stone-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur sm:p-8">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
      <div className="flex flex-col gap-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">
            Magic Recipe
          </p>
          <div className="space-y-3">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance text-stone-50 sm:text-6xl">
              Turn a few ingredients into dinner.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-stone-300 sm:text-lg">
              Add ingredients one by one, then ask the app to build one practical
              recipe around them.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-stone-200">
              Ingredient
            </span>
            <input
              value={ingredientInput}
              onChange={(event) => onInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  onAddIngredient()
                }
              }}
              placeholder="Try tomato, chickpeas, spinach..."
              className="h-13 rounded-2xl border border-stone-700 bg-stone-900/80 px-4 text-base text-stone-50 outline-none transition placeholder:text-stone-500 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20"
            />
          </label>

          <button
            type="button"
            onClick={onAddIngredient}
            disabled={isLoading}
            className="h-13 rounded-2xl border border-amber-300/40 bg-amber-200 px-5 text-sm font-semibold text-stone-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 sm:self-end"
          >
            Add
          </button>
        </div>

        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-stone-800 bg-stone-900/55 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-stone-100">
              {ingredientsCount} / 15 ingredients
            </p>
            <p className="text-sm text-stone-400">
              You need at least 2 ingredients before generating a recipe.
            </p>
          </div>

          <button
            type="button"
            onClick={onSubmit}
            disabled={isLoading}
            className="inline-flex min-h-13 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 px-6 text-sm font-semibold text-stone-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Working...' : 'Do magic'}
          </button>
        </div>
      </div>
    </section>
  )
}
