/**
 * Scholarship Embedding Utilities
 *
 * This module provides functions for generating embeddings for scholarships
 * on-demand and converting scholarship data to rich text representations
 * optimized for semantic matching.
 *
 * Key features:
 * - Rich text conversion with semantic context
 * - On-demand embedding generation
 * - Embedding versioning for model upgrades
 * - File-based persistence with append support
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'
import { Scholarship } from './scholarshipData.js'
import { EmbeddingRecord } from './embeddings.js'
import { getEmbedding } from './openai.js'

// Current embedding schema version - increment when text format changes
export const EMBEDDING_VERSION = '1.1.0'

// Default embedding model
export const DEFAULT_EMBEDDING_MODEL = 'text-embedding-ada-002'

/**
 * Converts a scholarship to a rich text representation optimized for embeddings.
 *
 * This format includes:
 * - Semantic phrases that match how students search
 * - Expanded aliases for education levels
 * - Income context with meaningful brackets
 * - Category context with full names
 */
export function scholarshipToText(s: Scholarship): string {
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
export function generateTextHash(text: string): string {
  return createHash('md5').update(text).digest('hex').substring(0, 16)
}

/**
 * Gets the path to the embeddings file.
 */
function getEmbeddingsPath(): string {
  return join(__dirname, '..', '..', 'data', 'embeddings.json')
}

/**
 * Loads all embeddings from file.
 */
export function loadEmbeddingsFromFile(): EmbeddingRecord[] {
  const filePath = getEmbeddingsPath()
  if (!existsSync(filePath)) {
    return []
  }
  try {
    const data = readFileSync(filePath, 'utf-8')
    return JSON.parse(data) as EmbeddingRecord[]
  } catch {
    return []
  }
}

/**
 * Saves all embeddings to file.
 */
export function saveEmbeddingsToFile(embeddings: EmbeddingRecord[]): void {
  const filePath = getEmbeddingsPath()
  writeFileSync(filePath, JSON.stringify(embeddings, null, 2), 'utf-8')
}

/**
 * Generates embedding for a single scholarship and saves it.
 * Returns the embedding record on success, null on failure.
 */
export async function generateScholarshipEmbedding(
  scholarship: Scholarship
): Promise<EmbeddingRecord | null> {
  try {
    const text = scholarshipToText(scholarship)
    const embedding = await getEmbedding(text)
    const deploymentName = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || DEFAULT_EMBEDDING_MODEL

    const record: EmbeddingRecord = {
      id: scholarship.id,
      embedding,
      model: deploymentName,
      version: EMBEDDING_VERSION,
      generatedAt: new Date().toISOString(),
      textHash: generateTextHash(text)
    }

    return record
  } catch (error) {
    console.error(`Failed to generate embedding for scholarship ${scholarship.id}:`, error)
    return null
  }
}

/**
 * Generates embedding for a scholarship and appends it to the embeddings file.
 * If an embedding already exists for this ID, it will be replaced.
 */
export async function generateAndSaveScholarshipEmbedding(
  scholarship: Scholarship
): Promise<EmbeddingRecord | null> {
  const record = await generateScholarshipEmbedding(scholarship)
  if (!record) return null

  // Load existing embeddings
  const embeddings = loadEmbeddingsFromFile()

  // Remove existing embedding for this ID if present
  const existingIndex = embeddings.findIndex(e => e.id === scholarship.id)
  if (existingIndex >= 0) {
    embeddings[existingIndex] = record
  } else {
    embeddings.push(record)
  }

  // Save back to file
  saveEmbeddingsToFile(embeddings)

  return record
}

/**
 * Removes embedding for a scholarship from the embeddings file.
 */
export function removeScholarshipEmbedding(scholarshipId: string): boolean {
  const embeddings = loadEmbeddingsFromFile()
  const index = embeddings.findIndex(e => e.id === scholarshipId)

  if (index < 0) return false

  embeddings.splice(index, 1)
  saveEmbeddingsToFile(embeddings)
  return true
}

/**
 * Checks if an embedding exists for a scholarship and if it's up-to-date.
 */
export function isEmbeddingUpToDate(
  scholarship: Scholarship,
  embeddings: EmbeddingRecord[]
): boolean {
  const existing = embeddings.find(e => e.id === scholarship.id)
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

/**
 * Gets scholarships that need embeddings generated or updated.
 */
export function getScholarshipsNeedingEmbeddings(
  scholarships: Scholarship[],
  embeddings: EmbeddingRecord[]
): Scholarship[] {
  return scholarships.filter(s => !isEmbeddingUpToDate(s, embeddings))
}
