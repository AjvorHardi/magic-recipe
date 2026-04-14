type RecipeStepsProps = {
  steps: string[]
}

export function RecipeSteps({ steps }: RecipeStepsProps) {
  return (
    <details className="group rounded-[1.5rem] border border-stone-800 bg-stone-950/60 p-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
            Full recipe
          </p>
          <p className="mt-1 text-sm text-stone-400">
            Expand for step-by-step cooking instructions.
          </p>
        </div>
        <span className="text-sm font-medium text-stone-200 transition group-open:rotate-45">
          +
        </span>
      </summary>

      <ol className="mt-5 space-y-4">
        {steps.map((step, index) => (
          <li
            key={`${index + 1}-${step}`}
            className="grid gap-3 rounded-2xl border border-stone-800 bg-stone-900/80 p-4 sm:grid-cols-[auto_minmax(0,1fr)]"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-200 text-sm font-semibold text-stone-950">
              {index + 1}
            </span>
            <p className="text-sm leading-6 text-stone-200">{step}</p>
          </li>
        ))}
      </ol>
    </details>
  )
}
