/**
 * Profile Embedding Utilities
 *
 * This module converts structured student profiles into text representations
 * suitable for embedding generation. The text format is optimized for
 * semantic matching against scholarship descriptions.
 *
 * Learning concepts:
 * - Text representation affects embedding quality
 * - Rich context improves semantic matching
 * - Balance between verbosity and relevance
 */

export interface StudentProfile {
  state?: string
  category?: string
  income?: string
  educationLevel?: string
  gender?: string
  disability?: boolean
  religion?: string
  area?: string
  course?: string
}

/**
 * Converts a structured student profile into a natural language text
 * representation suitable for embedding generation.
 *
 * The generated text mirrors the format used in scholarshipToText()
 * from generateEmbeddings.ts to ensure embedding space compatibility.
 *
 * @param profile - The student profile to convert
 * @returns A text string describing the student profile
 */
export function profileToText(profile: StudentProfile): string {
  const parts: string[] = []

  // Core identity - State
  if (profile.state) {
    parts.push(`Student from ${profile.state}`)
  }

  // Category (SC/ST/OBC/General)
  if (profile.category) {
    parts.push(`Category: ${profile.category}`)
  }

  // Gender
  if (profile.gender) {
    parts.push(`Gender: ${profile.gender}`)
  }

  // Academic context - Education level
  if (profile.educationLevel) {
    parts.push(`Education level: ${profile.educationLevel}`)
  }

  // Field of study / Course
  if (profile.course) {
    parts.push(`Field of study: ${profile.course}`)
  }

  // Economic context - Income
  if (profile.income) {
    const incomeNum = parseInt(profile.income, 10)
    if (!isNaN(incomeNum)) {
      parts.push(`Family income: Rs. ${incomeNum.toLocaleString()} per annum`)

      // Add semantic descriptors for income brackets
      // These help the embedding understand economic context better
      if (incomeNum <= 100000) {
        parts.push(`Economically weaker section (EWS)`)
      } else if (incomeNum <= 250000) {
        parts.push(`Lower income family`)
      } else if (incomeNum <= 500000) {
        parts.push(`Lower middle income family`)
      } else if (incomeNum <= 800000) {
        parts.push(`Middle income family`)
      }
    }
  }

  // Disability status
  if (profile.disability) {
    parts.push(`Person with disability (PwD)`)
  }

  // Religion / Community
  if (profile.religion && profile.religion !== 'all') {
    parts.push(`Religion: ${profile.religion}`)
  }

  // Area (Urban/Rural)
  if (profile.area && profile.area !== 'all') {
    parts.push(`Area: ${profile.area}`)
  }

  // Return joined text or a default if profile is empty
  if (parts.length === 0) {
    return 'Student seeking scholarship opportunities in India'
  }

  return parts.join('. ') + '.'
}

/**
 * Generates a cache key for a student profile.
 * Used to avoid redundant embedding API calls.
 *
 * @param profile - The student profile
 * @returns A string key uniquely identifying this profile combination
 */
export function getProfileCacheKey(profile: StudentProfile): string {
  // Create a deterministic string from profile values
  const keyParts = [
    profile.state || '',
    profile.category || '',
    profile.income || '',
    profile.educationLevel || '',
    profile.gender || '',
    profile.disability ? '1' : '0',
    profile.religion || '',
    profile.area || '',
    profile.course || ''
  ]
  return keyParts.join('|')
}

/**
 * Configuration for hybrid scoring weights.
 * Exported for easy experimentation and tuning.
 */
export const SCORING_CONFIG = {
  // Hybrid scoring weights (must sum to 1.0)
  ELIGIBILITY_WEIGHT: 0.7,  // alpha - weight for rule-based eligibility score
  SEMANTIC_WEIGHT: 0.3,     // beta - weight for semantic similarity score

  // Thresholds
  MIN_RECOMMENDATION_SCORE: 20,      // Minimum score to be included in recommendations
  MIN_SEMANTIC_SUGGESTION_SCORE: 40, // Minimum semantic score for "You Might Also Like"
  STRONG_SEMANTIC_MATCH: 60,         // Score above which we highlight semantic match

  // Limits
  MAX_RECOMMENDATIONS: 20,
  MAX_SEMANTIC_SUGGESTIONS: 5,
}
