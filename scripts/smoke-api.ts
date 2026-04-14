import generateRecipeHandler from '../api/generate-recipe.ts'

type SmokeCase = {
  label: string
  payload: unknown
  expectedStatus: number
}

const smokeCases: SmokeCase[] = [
  {
    label: 'valid request',
    payload: {
      ingredients: ['tomato', 'garlic', 'basil'],
    },
    expectedStatus: 200,
  },
  {
    label: 'duplicate ingredient request',
    payload: {
      ingredients: ['tomato', ' Tomato '],
    },
    expectedStatus: 400,
  },
]

async function run(): Promise<void> {
  process.env.MOCK_RECIPE_MODE = 'true'

  for (const smokeCase of smokeCases) {
    const request = new Request('http://localhost/api/generate-recipe', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(smokeCase.payload),
    })

    const response = await generateRecipeHandler.fetch(request)
    const body = await response.text()

    if (response.status !== smokeCase.expectedStatus) {
      throw new Error(
        `${smokeCase.label} failed: expected ${smokeCase.expectedStatus}, received ${response.status}. Body: ${body}`,
      )
    }

    console.log(`[ok] ${smokeCase.label}: ${response.status}`)
    console.log(body)
  }
}

run().catch((error: unknown) => {
  console.error('[fail] smoke:api', error)
  process.exitCode = 1
})
