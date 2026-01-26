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
 * The generated text mirrors the format and semantic phrasing used in
 * scholarshipToText() to ensure embedding space compatibility.
 *
 * Key principles for symmetric matching:
 * - Use similar phrases as scholarship descriptions
 * - Include aliases and alternative terms students might use
 * - Add semantic context that maps to scholarship eligibility
 *
 * @param profile - The student profile to convert
 * @returns A text string describing the student profile
 */
export function profileToText(profile: StudentProfile): string {
  const parts: string[] = []

  // Core identity - State (matching scholarship state phrasing)
  if (profile.state) {
    parts.push(`Student from ${profile.state}`)
    parts.push(`Looking for scholarships in ${profile.state}`)
    parts.push(`State-specific scholarship seeker from ${profile.state}`)
  } else {
    parts.push('Looking for nationwide scholarships, pan-India opportunities')
  }

  // Category with full context (matching scholarship category phrasing)
  if (profile.category) {
    const categoryPhrases: Record<string, string> = {
      'SC': 'Scheduled Caste (SC) student, SC category eligible',
      'ST': 'Scheduled Tribe (ST) student, ST category eligible',
      'OBC': 'Other Backward Class (OBC) student, OBC category eligible',
      'General': 'General category student',
      'EWS': 'Economically Weaker Section (EWS) student'
    }
    parts.push(categoryPhrases[profile.category] || `Category: ${profile.category}`)
  }

  // Gender (matching scholarship gender phrasing)
  if (profile.gender) {
    if (profile.gender === 'female') {
      parts.push('Female student, girl student, women scholarship seeker')
    } else if (profile.gender === 'male') {
      parts.push('Male student')
    }
  }

  // Education level with aliases (matching scholarship education level expansion)
  if (profile.educationLevel) {
    const levelMap: Record<string, string> = {
      'class_1_to_8': 'Studying in Class 1 to 8, primary school, elementary, middle school student',
      'class_9': 'Studying in Class 9, 9th grade, secondary school student',
      'class_10': 'Studying in Class 10, 10th grade, SSLC, matric level student',
      'class_11': 'Studying in Class 11, 11th grade, plus one, intermediate first year, junior college',
      'class_12': 'Studying in Class 12, 12th grade, plus two, HSC, pre-university, intermediate second year',
      'undergraduate': 'Undergraduate student, pursuing bachelor degree, graduation, UG, college student, BA, BSc, BCom, BTech, BE',
      'postgraduate': 'Postgraduate student, pursuing master degree, PG, post graduation, MA, MSc, MCom, MTech, ME, MBA',
      'professional': 'Professional course student, engineering, medical, law, MBBS, LLB student',
      'diploma': 'Diploma student, polytechnic, ITI, vocational training',
      'phd': 'PhD student, doctoral researcher, pursuing doctorate'
    }
    parts.push(levelMap[profile.educationLevel] || `Education level: ${profile.educationLevel}`)
  }

  // Field of study / Course
  if (profile.course) {
    parts.push(`Field of study: ${profile.course}`)
    parts.push(`Studying ${profile.course}`)
  }

  // Income with semantic context (matching scholarship income brackets)
  if (profile.income) {
    const incomeNum = parseInt(profile.income, 10)
    if (!isNaN(incomeNum)) {
      parts.push(`Family income: Rs. ${incomeNum.toLocaleString('en-IN')} per annum`)

      // Use same semantic brackets as scholarshipToText
      if (incomeNum <= 100000) {
        parts.push('Economically weaker family, very low income, BPL, below poverty line')
      } else if (incomeNum <= 250000) {
        parts.push('Low income family, economically disadvantaged, needs financial support')
      } else if (incomeNum <= 500000) {
        parts.push('Lower middle income family')
      } else if (incomeNum <= 800000) {
        parts.push('Middle income family')
      }
    }
  }

  // Disability status (matching scholarship disability phrasing)
  if (profile.disability) {
    parts.push('Student with disability, PwD, differently abled, special needs')
  }

  // Religion / Community (matching scholarship religion phrasing)
  if (profile.religion && profile.religion !== 'all') {
    parts.push(`${profile.religion} community student`)
    parts.push(`Religion: ${profile.religion}`)
  }

  // Area (matching scholarship area phrasing)
  if (profile.area && profile.area !== 'all') {
    if (profile.area === 'rural') {
      parts.push('Rural area student, from village, countryside')
    } else if (profile.area === 'urban') {
      parts.push('Urban area student, from city, metropolitan')
    }
  }

  // Return joined text or a default if profile is empty
  if (parts.length === 0) {
    return 'Student seeking scholarship opportunities in India, nationwide scholarships'
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
