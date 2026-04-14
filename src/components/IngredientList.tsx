type IngredientListProps = {
  ingredients: string[]
  onRemoveIngredient: (ingredient: string) => void
}

export function IngredientList({
  ingredients,
  onRemoveIngredient,
}: IngredientListProps) {
  if (ingredients.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-stone-300/30 bg-stone-900/40 px-5 py-6 text-sm leading-6 text-stone-300">
        Add at least two ingredients to start the magic. Pantry staples like
        salt, pepper, oil, and water are assumed.
      </div>
    )
  }

  return (
    <ul className="flex flex-wrap gap-3">
      {ingredients.map((ingredient) => (
        <li key={ingredient}>
          <button
            type="button"
            onClick={() => onRemoveIngredient(ingredient)}
            className="inline-flex items-center gap-3 rounded-full border border-amber-200/20 bg-stone-950/70 px-4 py-2 text-sm font-medium text-stone-100 transition hover:border-amber-300/50 hover:bg-stone-900"
            aria-label={`Remove ${ingredient}`}
          >
            <span>{ingredient}</span>
            <span className="text-amber-300">x</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
