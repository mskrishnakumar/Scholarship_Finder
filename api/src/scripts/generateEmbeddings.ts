/**
 * Embedding Generation Script
 *
 * Generates embeddings for scholarships with support for:
 * - Incremental updates (only processes new/changed scholarships)
 * - Full regeneration (--force flag)
 * - Embedding versioning for model upgrades
 *
 * Usage:
 *   npm run generate-embeddings                    # Incremental (recommended)
 *   npm run generate-embeddings -- --force         # Full regeneration
 *
 * Or with ts-node (requires env vars set manually):
 *   npx ts-node api/src/scripts/generateEmbeddings.ts
 *   npx ts-node api/src/scripts/generateEmbeddings.ts --force
 *
 * Environment variables required:
 *   AZURE_OPENAI_ENDPOINT - Your Azure OpenAI endpoint
 *   AZURE_OPENAI_KEY - Your Azure OpenAI API key
 *   AZURE_OPENAI_EMBEDDING_DEPLOYMENT - Embedding model deployment name (optional, defaults to text-embedding-ada-002)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'
import { config } from 'dotenv'
import { AzureOpenAI } from 'openai'

// Load .env from project root (handles both ts-node and compiled JS paths)
const envPath = join(__dirname, '..', '..', '..', '.env')
const envPathAlt = join(__dirname, '..', '..', '.env')
config({ path: existsSync(envPath) ? envPath : envPathAlt })

// Current embedding schema version - increment when text format changes
const EMBEDDING_VERSION = '1.1.0'

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
  model?: string
  version?: string
  generatedAt?: string
  textHash?: string
}

/**
 * Converts a scholarship to a rich text representation optimized for embeddings.
 * This must match the implementation in scholarshipEmbedding.ts
 */
function scholarshipToText(s: Scholarship): string {
  const parts: string[] = []

  // Core identity
  parts.push(`${s.name} scholarship`)
  parts.push(s.description)

  // State with semantic phrasing
  if (s.eligibility.states.includes('all')) {
    parts.push('Available across all states in India, nationwide scholarship, pan-India')
  } else {
    const states = s.eligibility.states.join(', ')
    parts.push(`For students from ${states}`)
    parts.push(`State-specific scholarship for ${states}`)
  }

  // Category with full context
  const cats = s.eligibility.categories
  if (cats.includes('all')) {
    parts.push('Open to all categories')
  } else {
    const categoryPhrases: string[] = []
    if (cats.includes('SC')) {
      categoryPhrases.push('Scheduled Caste (SC) students eligible')
    }
    if (cats.includes('ST')) {
      categoryPhrases.push('Scheduled Tribe (ST) students eligible')
    }
    if (cats.includes('OBC')) {
      categoryPhrases.push('Other Backward Class (OBC) students eligible')
    }
    if (cats.includes('General')) {
      categoryPhrases.push('General category students eligible')
    }
    if (cats.includes('EWS')) {
      categoryPhrases.push('Economically Weaker Section (EWS) students eligible')
    }
    if (categoryPhrases.length > 0) {
      parts.push(categoryPhrases.join('. '))
    }
  }

  // Income with semantic meaning
  if (s.eligibility.maxIncome) {
    const income = s.eligibility.maxIncome
    parts.push(`Family income limit: Rs. ${income.toLocaleString('en-IN')} per annum`)
    if (income <= 100000) {
      parts.push('For economically weaker families, very low income, BPL, below poverty line')
    } else if (income <= 250000) {
      parts.push('For low income families, economically disadvantaged')
    } else if (income <= 500000) {
      parts.push('For lower middle income families')
    } else if (income <= 800000) {
      parts.push('For middle income families')
    }
  } else {
    parts.push('No income restriction, open to all income levels')
  }

  // Education level with aliases
  const levels = s.eligibility.educationLevels
  if (levels.length > 0 && !levels.includes('all')) {
    const levelMap: Record<string, string> = {
      'class_1_to_8': 'Class 1 to 8, primary school, elementary, middle school',
      'class_9': 'Class 9, 9th grade, secondary school',
      'class_10': 'Class 10, 10th grade, SSLC, matric, secondary school',
      'class_11': 'Class 11, 11th grade, plus one, intermediate first year, junior college',
      'class_12': 'Class 12, 12th grade, plus two, HSC, pre-university, intermediate second year',
      'undergraduate': 'Undergraduate, bachelor degree, graduation, UG, college, BA, BSc, BCom, BTech, BE',
      'postgraduate': 'Postgraduate, master degree, PG, post graduation, MA, MSc, MCom, MTech, ME, MBA',
      'professional': 'Professional courses, engineering, medical, law, MBBS, LLB, chartered accountancy',
      'diploma': 'Diploma courses, polytechnic, ITI, vocational training',
      'phd': 'PhD, doctoral, research, doctorate'
    }
    const expandedLevels = levels.map(l => levelMap[l] || l).join('; ')
    parts.push(`Education levels: ${expandedLevels}`)
  }

  // Gender
  if (s.eligibility.gender !== 'all') {
    if (s.eligibility.gender === 'female') {
      parts.push('For female students only, girls scholarship, women empowerment')
    } else if (s.eligibility.gender === 'male') {
      parts.push('For male students only')
    }
  }

  // Disability
  if (s.eligibility.disability) {
    parts.push('For students with disabilities, PwD, differently abled, special needs')
  }

  // Religion
  const religion = s.eligibility.religion
  if (religion !== 'all') {
    const religions = Array.isArray(religion) ? religion : [religion]
    if (!religions.includes('all')) {
      parts.push(`For ${religions.join(', ')} community students`)
    }
  }

  // Area
  if (s.eligibility.area !== 'all') {
    if (s.eligibility.area === 'rural') {
      parts.push('For rural area students, village, countryside')
    } else if (s.eligibility.area === 'urban') {
      parts.push('For urban area students, city, metropolitan')
    }
  }

  // Courses
  const courses = s.eligibility.courses
  if (courses.length > 0 && !courses.includes('all')) {
    parts.push(`Field of study: ${courses.join(', ')}`)
  }

  // Benefits
  if (s.benefits) {
    parts.push(`Benefits: ${s.benefits}`)
  }

  return parts.join('. ')
}

/**
 * Generates a hash of the scholarship text for cache invalidation.
 */
function generateTextHash(text: string): string {
  return createHash('md5').update(text).digest('hex').substring(0, 16)
}

/**
 * Checks if an embedding is up-to-date based on version and text hash.
 */
function isEmbeddingUpToDate(
  scholarship: Scholarship,
  existing: EmbeddingRecord | undefined
): boolean {
  if (!existing) return false

  // Check version
  if (existing.version !== EMBEDDING_VERSION) return false

  // Check text hash if available
  if (existing.textHash) {
    const currentText = scholarshipToText(scholarship)
    const currentHash = generateTextHash(currentText)
    if (existing.textHash !== currentHash) return false
  }

  return true
}

async function main() {
  const forceRegenerate = process.argv.includes('--force')

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

  // In compiled JS, __dirname is api/dist/scripts, so go up 2 levels to api/data
  // In ts-node, __dirname is api/src/scripts, so also go up 2 levels to api/data
  const dataPath = join(__dirname, '..', '..', 'data')
  const scholarshipsPath = join(dataPath, 'scholarships.json')
  const privateScholarshipsPath = join(dataPath, 'private-scholarships.json')
  const embeddingsPath = join(dataPath, 'embeddings.json')

  // Load all scholarships (public + private approved)
  console.log(`Reading scholarships from: ${scholarshipsPath}`)
  const publicScholarships: Scholarship[] = JSON.parse(readFileSync(scholarshipsPath, 'utf-8'))

  let privateScholarships: Scholarship[] = []
  if (existsSync(privateScholarshipsPath)) {
    const privateData = JSON.parse(readFileSync(privateScholarshipsPath, 'utf-8'))
    privateScholarships = privateData.filter((s: Scholarship & { status?: string }) => s.status === 'approved')
  }

  const allScholarships = [...publicScholarships, ...privateScholarships]
  console.log(`Found ${allScholarships.length} scholarships (${publicScholarships.length} public, ${privateScholarships.length} private approved)`)

  // Load existing embeddings
  let existingEmbeddings: EmbeddingRecord[] = []
  const embeddingMap = new Map<string, EmbeddingRecord>()

  if (!forceRegenerate && existsSync(embeddingsPath)) {
    try {
      existingEmbeddings = JSON.parse(readFileSync(embeddingsPath, 'utf-8'))
      existingEmbeddings.forEach(e => embeddingMap.set(e.id, e))
      console.log(`Loaded ${existingEmbeddings.length} existing embeddings`)
    } catch {
      console.log('Could not load existing embeddings, will regenerate all')
    }
  }

  if (forceRegenerate) {
    console.log('Force regeneration enabled - will regenerate all embeddings')
  }

  // Determine which scholarships need embedding
  const scholarshipsToProcess = forceRegenerate
    ? allScholarships
    : allScholarships.filter(s => !isEmbeddingUpToDate(s, embeddingMap.get(s.id)))

  // Track scholarships that no longer exist (for cleanup)
  const currentIds = new Set(allScholarships.map(s => s.id))
  const orphanedIds = existingEmbeddings.filter(e => !currentIds.has(e.id)).map(e => e.id)

  if (orphanedIds.length > 0) {
    console.log(`Found ${orphanedIds.length} orphaned embeddings (scholarships removed)`)
  }

  if (scholarshipsToProcess.length === 0 && orphanedIds.length === 0) {
    console.log('\nAll embeddings are up-to-date! Nothing to do.')
    return
  }

  console.log(`\nProcessing ${scholarshipsToProcess.length} scholarships (${allScholarships.length - scholarshipsToProcess.length} already up-to-date)...`)

  // Generate embeddings for scholarships that need it
  const newEmbeddings: EmbeddingRecord[] = []

  for (const scholarship of scholarshipsToProcess) {
    const text = scholarshipToText(scholarship)
    const isUpdate = embeddingMap.has(scholarship.id)
    console.log(`  ${isUpdate ? 'Updating' : 'Generating'}: ${scholarship.name}`)

    try {
      const response = await client.embeddings.create({
        model: deploymentName,
        input: text
      })

      newEmbeddings.push({
        id: scholarship.id,
        embedding: response.data[0].embedding,
        model: deploymentName,
        version: EMBEDDING_VERSION,
        generatedAt: new Date().toISOString(),
        textHash: generateTextHash(text)
      })

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      console.error(`  Failed to generate embedding for ${scholarship.name}:`, error)
    }
  }

  // Merge with existing embeddings
  const finalEmbeddings: EmbeddingRecord[] = []

  if (forceRegenerate) {
    // Use only new embeddings
    finalEmbeddings.push(...newEmbeddings)
  } else {
    // Start with existing embeddings (excluding orphaned and updated ones)
    const updatedIds = new Set(newEmbeddings.map(e => e.id))
    const orphanedIdSet = new Set(orphanedIds)

    for (const existing of existingEmbeddings) {
      if (!updatedIds.has(existing.id) && !orphanedIdSet.has(existing.id)) {
        finalEmbeddings.push(existing)
      }
    }

    // Add new/updated embeddings
    finalEmbeddings.push(...newEmbeddings)
  }

  // Save embeddings
  writeFileSync(embeddingsPath, JSON.stringify(finalEmbeddings, null, 2))

  // Summary
  console.log('\n--- Summary ---')
  console.log(`Embeddings written to: ${embeddingsPath}`)
  console.log(`Total embeddings: ${finalEmbeddings.length}`)
  console.log(`  - New: ${scholarshipsToProcess.filter(s => !embeddingMap.has(s.id)).length}`)
  console.log(`  - Updated: ${scholarshipsToProcess.filter(s => embeddingMap.has(s.id)).length}`)
  console.log(`  - Unchanged: ${finalEmbeddings.length - newEmbeddings.length}`)
  console.log(`  - Removed (orphaned): ${orphanedIds.length}`)
  console.log(`Embedding version: ${EMBEDDING_VERSION}`)
  console.log(`Model: ${deploymentName}`)
}

main().catch(error => {
  console.error('Failed to generate embeddings:', error)
  process.exit(1)
})
