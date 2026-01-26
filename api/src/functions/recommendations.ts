import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { loadApprovedScholarships, loadEmbeddings, Scholarship } from '../shared/scholarshipData.js'
import { cosineSimilarity, EmbeddingRecord } from '../shared/embeddings.js'
import { getEmbedding } from '../shared/openai.js'
import {
  StudentProfile,
  profileToText,
  getProfileCacheKey,
  SCORING_CONFIG
} from '../shared/profileEmbedding.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
}

// Request body extends StudentProfile with semantic matching option
interface RecommendationRequest extends StudentProfile {
  useSemanticMatching?: boolean
}

// Enhanced scored scholarship with semantic information
interface ScoredScholarship {
  id: string
  name: string
  description: string
  benefits: string
  deadline: string
  applicationSteps: string[]
  requiredDocuments: string[]
  officialUrl: string
  matchScore: number
  eligibilityScore?: number
  semanticScore?: number
  matchReasons: string[]
  eligibilityWarnings?: string[]
}

// Simple in-memory cache for profile embeddings
// In production, consider using Redis or similar
const profileEmbeddingCache = new Map<string, { embedding: number[]; timestamp: number }>()
const CACHE_TTL_MS = 30 * 60 * 1000 // 30 minutes

/**
 * Get or generate embedding for a student profile.
 * Uses caching to avoid redundant API calls.
 */
async function getProfileEmbedding(profile: StudentProfile): Promise<number[]> {
  const cacheKey = getProfileCacheKey(profile)
  const cached = profileEmbeddingCache.get(cacheKey)

  // Return cached embedding if still valid
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
    return cached.embedding
  }

  // Generate new embedding
  const profileText = profileToText(profile)
  const embedding = await getEmbedding(profileText)

  // Cache the result
  profileEmbeddingCache.set(cacheKey, {
    embedding,
    timestamp: Date.now()
  })

  return embedding
}

/**
 * Build a Map of scholarship ID -> embedding for fast lookup
 */
function buildEmbeddingMap(embeddings: EmbeddingRecord[]): Map<string, number[]> {
  const map = new Map<string, number[]>()
  for (const record of embeddings) {
    map.set(record.id, record.embedding)
  }
  return map
}

/**
 * Get eligibility warnings for scholarships that don't fully match
 * but might still be interesting to the user.
 */
function getEligibilityWarnings(scholarship: Scholarship, profile: StudentProfile): string[] {
  const warnings: string[] = []
  const elig = scholarship.eligibility

  // Income warning
  if (profile.income && elig.maxIncome !== null) {
    const incomeNum = parseInt(profile.income, 10)
    if (incomeNum > elig.maxIncome) {
      warnings.push(`Income limit: ₹${elig.maxIncome.toLocaleString()}`)
    }
  }

  // State warning
  if (profile.state && !elig.states.includes('all') && !elig.states.includes(profile.state)) {
    warnings.push(`Limited to: ${elig.states.slice(0, 3).join(', ')}${elig.states.length > 3 ? '...' : ''}`)
  }

  // Gender warning
  if (profile.gender && elig.gender !== 'all' && elig.gender !== profile.gender) {
    warnings.push(`For ${elig.gender} students only`)
  }

  // Category warning
  if (profile.category) {
    const categories = Array.isArray(elig.categories) ? elig.categories : [elig.categories]
    if (!categories.includes('all') && !categories.includes(profile.category)) {
      warnings.push(`For ${categories.join('/')} category`)
    }
  }

  return warnings
}

function scoreScholarship(scholarship: Scholarship, profile: StudentProfile): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []
  const elig = scholarship.eligibility

  // State match (+25 for state-specific, +10 for 'all' states)
  // State-specific scholarships get higher priority to surface local opportunities
  if (profile.state) {
    if (elig.states.includes(profile.state) && !elig.states.includes('all')) {
      // State-specific scholarship - higher bonus
      score += 25
      reasons.push(`Specifically for ${profile.state}`)
    } else if (elig.states.includes('all') || elig.states.includes(profile.state)) {
      // Available nationwide or includes the state
      score += 10
    }
  }

  // Category match (+20)
  if (profile.category) {
    const categories = Array.isArray(elig.categories) ? elig.categories : [elig.categories]
    if (categories.includes('all') || categories.includes(profile.category)) {
      score += 20
      if (!categories.includes('all')) {
        reasons.push(`Matches your category (${profile.category})`)
      }
    }
  }

  // Income eligible (+15)
  if (profile.income) {
    const incomeNum = parseInt(profile.income, 10)
    if (elig.maxIncome === null || incomeNum <= elig.maxIncome) {
      score += 15
      if (elig.maxIncome !== null) {
        reasons.push(`Within income limit (Rs. ${elig.maxIncome.toLocaleString()})`)
      }
    }
  }

  // Education level match (+15)
  if (profile.educationLevel) {
    if (elig.educationLevels.includes(profile.educationLevel)) {
      score += 15
      reasons.push(`Matches your education level`)
    }
  }

  // Gender match (+10)
  if (profile.gender) {
    if (elig.gender === 'all' || elig.gender === profile.gender) {
      score += 10
      if (elig.gender !== 'all') {
        reasons.push(`For ${elig.gender} students`)
      }
    }
  }

  // Disability match (+5)
  if (profile.disability !== undefined) {
    if (!elig.disability || elig.disability === profile.disability) {
      score += 5
      if (elig.disability && profile.disability) {
        reasons.push(`For students with disabilities`)
      }
    }
  }

  // Religion match (+5)
  if (profile.religion) {
    const religions = Array.isArray(elig.religion) ? elig.religion : [elig.religion]
    if (religions.includes('all') || religions.includes(profile.religion)) {
      score += 5
      if (!religions.includes('all')) {
        reasons.push(`For ${profile.religion} community`)
      }
    }
  }

  // Area match (+5)
  if (profile.area) {
    if (elig.area === 'all' || elig.area === profile.area) {
      score += 5
      if (elig.area !== 'all') {
        reasons.push(`For ${elig.area} area students`)
      }
    }
  }

  // Course match (+10)
  if (profile.course) {
    if (elig.courses.includes('all') || elig.courses.includes(profile.course)) {
      score += 10
      if (!elig.courses.includes('all')) {
        reasons.push(`Matches your field (${profile.course})`)
      }
    }
  }

  return { score, reasons }
}

/**
 * Hybrid scoring: combines rule-based eligibility with semantic similarity.
 *
 * Learning concepts:
 * - alpha (ELIGIBILITY_WEIGHT): How much rule-based scoring matters
 * - beta (SEMANTIC_WEIGHT): How much semantic similarity matters
 * - finalScore = alpha * eligibilityScore + beta * semanticScore
 */
interface HybridScoreResult {
  eligibilityScore: number
  semanticScore: number
  finalScore: number
  matchReasons: string[]
}

function calculateHybridScore(
  scholarship: Scholarship,
  profile: StudentProfile,
  profileEmbedding: number[],
  embeddingMap: Map<string, number[]>,
  useSemanticMatching: boolean
): HybridScoreResult {
  // Get rule-based eligibility score
  const { score: eligibilityScore, reasons: matchReasons } = scoreScholarship(scholarship, profile)

  // Calculate semantic score if enabled
  let semanticScore = 0
  if (useSemanticMatching && profileEmbedding.length > 0) {
    const scholarshipEmbedding = embeddingMap.get(scholarship.id)
    if (scholarshipEmbedding) {
      // Cosine similarity returns value between -1 and 1
      // Normalize to 0-100 scale for consistency
      const similarity = cosineSimilarity(profileEmbedding, scholarshipEmbedding)
      semanticScore = Math.round(Math.max(0, similarity) * 100)

      // Add semantic match reason if significant
      if (semanticScore >= SCORING_CONFIG.STRONG_SEMANTIC_MATCH) {
        matchReasons.push(`Strong profile match (${semanticScore}% similarity)`)
      } else if (semanticScore >= 40) {
        matchReasons.push(`Good profile match (${semanticScore}% similarity)`)
      }
    }
  }

  // Calculate weighted final score
  let finalScore: number
  if (useSemanticMatching) {
    finalScore = Math.round(
      SCORING_CONFIG.ELIGIBILITY_WEIGHT * eligibilityScore +
      SCORING_CONFIG.SEMANTIC_WEIGHT * semanticScore
    )
  } else {
    finalScore = eligibilityScore
  }

  return {
    eligibilityScore,
    semanticScore,
    finalScore,
    matchReasons
  }
}

/**
 * Get semantically similar scholarships that may not pass strict eligibility.
 * These are shown in "You Might Also Like" section.
 */
function getSemanticSuggestions(
  scholarships: Scholarship[],
  profile: StudentProfile,
  profileEmbedding: number[],
  embeddingMap: Map<string, number[]>,
  excludeIds: Set<string>,
  limit: number = SCORING_CONFIG.MAX_SEMANTIC_SUGGESTIONS
): ScoredScholarship[] {
  if (profileEmbedding.length === 0) {
    return []
  }

  // Score all scholarships by semantic similarity only
  const withSimilarity = scholarships
    .filter(s => !excludeIds.has(s.id))
    .map(s => {
      const embedding = embeddingMap.get(s.id)
      const similarity = embedding
        ? Math.max(0, cosineSimilarity(profileEmbedding, embedding))
        : 0
      const semanticScore = Math.round(similarity * 100)

      return {
        scholarship: s,
        semanticScore
      }
    })
    .filter(s => s.semanticScore >= SCORING_CONFIG.MIN_SEMANTIC_SUGGESTION_SCORE)
    .sort((a, b) => b.semanticScore - a.semanticScore)
    .slice(0, limit)

  // Convert to ScoredScholarship with eligibility warnings
  return withSimilarity.map(({ scholarship, semanticScore }) => {
    const warnings = getEligibilityWarnings(scholarship, profile)

    return {
      id: scholarship.id,
      name: scholarship.name,
      description: scholarship.description,
      benefits: scholarship.benefits,
      deadline: scholarship.deadline,
      applicationSteps: scholarship.applicationSteps,
      requiredDocuments: scholarship.requiredDocuments,
      officialUrl: scholarship.officialUrl,
      matchScore: semanticScore,
      semanticScore,
      matchReasons: [`Semantically similar to your profile (${semanticScore}%)`],
      eligibilityWarnings: warnings.length > 0 ? warnings : undefined
    }
  })
}

async function recommendations(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Recommendations endpoint called')

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return {
      status: 204,
      headers: CORS_HEADERS
    }
  }

  try {
    const body = await request.json() as RecommendationRequest
    const useSemanticMatching = body.useSemanticMatching ?? false

    const allScholarships = loadApprovedScholarships()

    // Load embeddings and build lookup map
    let embeddingMap = new Map<string, number[]>()
    let profileEmbedding: number[] = []

    if (useSemanticMatching) {
      const embeddings = loadEmbeddings()
      embeddingMap = buildEmbeddingMap(embeddings)

      // Generate profile embedding
      try {
        profileEmbedding = await getProfileEmbedding(body)
        context.log(`Generated profile embedding (${profileEmbedding.length} dimensions)`)
      } catch (embeddingError: any) {
        context.warn('Failed to generate profile embedding, falling back to rule-based:', embeddingError.message)
        // Continue with rule-based only
      }
    }

    // Score all scholarships with hybrid scoring
    const scored: ScoredScholarship[] = allScholarships
      .map(scholarship => {
        const result = calculateHybridScore(
          scholarship,
          body,
          profileEmbedding,
          embeddingMap,
          useSemanticMatching && profileEmbedding.length > 0
        )

        return {
          id: scholarship.id,
          name: scholarship.name,
          description: scholarship.description,
          benefits: scholarship.benefits,
          deadline: scholarship.deadline,
          applicationSteps: scholarship.applicationSteps,
          requiredDocuments: scholarship.requiredDocuments,
          officialUrl: scholarship.officialUrl,
          matchScore: result.finalScore,
          eligibilityScore: useSemanticMatching ? result.eligibilityScore : undefined,
          semanticScore: useSemanticMatching ? result.semanticScore : undefined,
          matchReasons: result.matchReasons
        }
      })
      .filter(s => s.matchScore >= SCORING_CONFIG.MIN_RECOMMENDATION_SCORE)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, SCORING_CONFIG.MAX_RECOMMENDATIONS)

    // Get semantic suggestions ("You Might Also Like") if semantic matching is enabled
    const recommendedIds = new Set(scored.map(s => s.id))
    const semanticSuggestions = useSemanticMatching
      ? getSemanticSuggestions(
          allScholarships,
          body,
          profileEmbedding,
          embeddingMap,
          recommendedIds
        )
      : []

    return {
      status: 200,
      headers: CORS_HEADERS,
      jsonBody: {
        recommendations: scored,
        semanticSuggestions,
        totalMatches: scored.length,
        matchingStrategy: useSemanticMatching && profileEmbedding.length > 0 ? 'hybrid' : 'rule-based'
      }
    }
  } catch (error: any) {
    context.error('Recommendations endpoint error:', error)
    return {
      status: 500,
      headers: CORS_HEADERS,
      jsonBody: { error: 'Internal server error', details: error.message }
    }
  }
}

app.http('recommendations', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: recommendations
})
