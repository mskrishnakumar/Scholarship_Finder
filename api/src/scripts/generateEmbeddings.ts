import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { AzureOpenAI } from 'openai'

interface Scholarship {
  id: string
  name: string
  description: string
  eligibility: {
    states: string[]
    categories: string[]
    maxIncome: number | null
    educationLevels: string[]
    gender: string
    disability: boolean
    religion: string | string[]
    area: string
    courses: string[]
  }
  benefits: string
}

interface EmbeddingRecord {
  id: string
  embedding: number[]
}

function scholarshipToText(s: Scholarship): string {
  const states = s.eligibility.states.join(', ')
  const categories = s.eligibility.categories.join(', ')
  const educationLevels = s.eligibility.educationLevels.join(', ')
  const courses = s.eligibility.courses.join(', ')
  const religion = Array.isArray(s.eligibility.religion)
    ? s.eligibility.religion.join(', ')
    : s.eligibility.religion
  const income = s.eligibility.maxIncome
    ? `Income limit: Rs. ${s.eligibility.maxIncome}`
    : 'No income limit'

  return [
    `Scholarship: ${s.name}`,
    `Description: ${s.description}`,
    `States: ${states}`,
    `Categories: ${categories}`,
    `Education levels: ${educationLevels}`,
    `Gender: ${s.eligibility.gender}`,
    `Disability required: ${s.eligibility.disability}`,
    `Religion: ${religion}`,
    `Area: ${s.eligibility.area}`,
    `Courses: ${courses}`,
    income,
    `Benefits: ${s.benefits}`
  ].join('. ')
}

async function main() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT
  const apiKey = process.env.AZURE_OPENAI_KEY
  const deploymentName = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-ada-002'

  if (!endpoint || !apiKey) {
    console.error('Error: AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY must be set as environment variables.')
    process.exit(1)
  }

  const client = new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion: '2024-04-01-preview'
  })

  const dataPath = join(__dirname, '..', '..', '..', 'data')
  const scholarshipsPath = join(dataPath, 'scholarships.json')
  const embeddingsPath = join(dataPath, 'embeddings.json')

  console.log(`Reading scholarships from: ${scholarshipsPath}`)
  const scholarships: Scholarship[] = JSON.parse(readFileSync(scholarshipsPath, 'utf-8'))

  console.log(`Generating embeddings for ${scholarships.length} scholarships...`)

  const embeddingRecords: EmbeddingRecord[] = []

  for (const scholarship of scholarships) {
    const text = scholarshipToText(scholarship)
    console.log(`  Embedding: ${scholarship.name}`)

    const response = await client.embeddings.create({
      model: deploymentName,
      input: text
    })

    embeddingRecords.push({
      id: scholarship.id,
      embedding: response.data[0].embedding
    })

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  writeFileSync(embeddingsPath, JSON.stringify(embeddingRecords, null, 2))
  console.log(`\nDone! Embeddings written to: ${embeddingsPath}`)
  console.log(`Total records: ${embeddingRecords.length}`)
}

main().catch(error => {
  console.error('Failed to generate embeddings:', error)
  process.exit(1)
})
