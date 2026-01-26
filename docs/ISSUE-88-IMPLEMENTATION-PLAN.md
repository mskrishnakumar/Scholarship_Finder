# Issue #88: Semantic Matching Implementation Plan

## Learning Objectives for Your Hackathon

This implementation is a **hands-on playground** to learn:
1. **RAG (Retrieval-Augmented Generation)** - How to combine vector search with LLMs
2. **Semantic Matching** - Using embeddings to find conceptually similar content
3. **Hybrid Scoring** - Combining rule-based and AI-based approaches
4. **Vector Similarity** - Cosine similarity, embedding spaces
5. **Azure OpenAI** - Practical usage of embedding and chat models

---

## Current Architecture Summary

### What Already Exists
| Component | Location | Purpose |
|-----------|----------|---------|
| Rule-based scoring | `api/src/functions/recommendations.ts` | 100-point scoring across 9 criteria |
| Embeddings storage | `data/embeddings.json` | Pre-computed 1536-dim vectors for ~50 scholarships |
| Embedding generator | `api/src/scripts/generateEmbeddings.ts` | Batch script using Azure OpenAI Ada-002 |
| Semantic search | `api/src/shared/scholarshipData.ts:searchScholarships()` | Used only for chat RAG |
| Similarity utils | `api/src/shared/embeddings.ts` | `cosineSimilarity()`, `findTopK()` |

### The Gap
Embeddings are **only used for chat/RAG** - the main recommendations endpoint ignores them entirely!

---

## Implementation Phases

### Phase 1: Profile-to-Text Conversion (Foundation)
**Goal:** Learn how to represent structured data as embeddable text

**Files to Create/Modify:**
- `api/src/shared/profileEmbedding.ts` (NEW)

**Implementation:**
```typescript
// api/src/shared/profileEmbedding.ts

export function profileToText(profile: StudentProfile): string {
  const parts: string[] = []

  // Core identity
  if (profile.state) parts.push(`Student from ${profile.state}`)
  if (profile.category) parts.push(`belonging to ${profile.category} category`)
  if (profile.gender) parts.push(`Gender: ${profile.gender}`)

  // Academic context
  if (profile.educationLevel) parts.push(`Currently studying ${profile.educationLevel}`)
  if (profile.course) parts.push(`pursuing ${profile.course}`)

  // Economic context
  if (profile.income) {
    const incomeNum = parseInt(profile.income)
    if (incomeNum < 100000) parts.push(`from economically weaker section`)
    else if (incomeNum < 300000) parts.push(`from lower income family`)
    else if (incomeNum < 600000) parts.push(`from middle income family`)
    else parts.push(`from higher income bracket`)
  }

  // Special considerations
  if (profile.disability) parts.push(`with disability`)
  if (profile.religion && profile.religion !== 'all') {
    parts.push(`from ${profile.religion} community`)
  }
  if (profile.area) parts.push(`from ${profile.area} area`)

  return parts.join('. ') + '.'
}
```

**Learning Points:**
- Text representation affects embedding quality
- Rich context improves semantic matching
- Balance between verbosity and relevance

---

### Phase 2: Hybrid Scoring Implementation (Core Learning)
**Goal:** Combine rule-based eligibility with semantic similarity

**Files to Modify:**
- `api/src/functions/recommendations.ts`
- `api/src/shared/embeddings.ts`

**Step 2.1: Add profile embedding generation**
```typescript
// In recommendations.ts

import { getEmbedding } from '../shared/openai'
import { profileToText } from '../shared/profileEmbedding'
import { cosineSimilarity } from '../shared/embeddings'
import { loadEmbeddings } from '../shared/scholarshipData'

// Cache for profile embeddings (simple in-memory)
const profileEmbeddingCache = new Map<string, number[]>()

async function getProfileEmbedding(profile: StudentProfile): Promise<number[]> {
  const profileText = profileToText(profile)
  const cacheKey = profileText // Simple cache by text

  if (profileEmbeddingCache.has(cacheKey)) {
    return profileEmbeddingCache.get(cacheKey)!
  }

  const embedding = await getEmbedding(profileText)
  profileEmbeddingCache.set(cacheKey, embedding)
  return embedding
}
```

**Step 2.2: Implement hybrid scoring**
```typescript
// New hybrid scoring function

interface HybridScore {
  eligibilityScore: number  // 0-100 (rule-based)
  semanticScore: number     // 0-100 (embedding similarity)
  finalScore: number        // Weighted combination
  matchReasons: string[]
}

async function hybridScoreScholarship(
  scholarship: Scholarship,
  profile: StudentProfile,
  profileEmbedding: number[],
  scholarshipEmbeddings: Map<string, number[]>,
  options: { alpha?: number; useSemanticMatching?: boolean } = {}
): Promise<HybridScore> {
  const alpha = options.alpha ?? 0.7  // eligibility weight
  const beta = 1 - alpha              // semantic weight

  // Get rule-based score (existing logic)
  const { score: eligibilityScore, reasons: matchReasons } = scoreScholarship(scholarship, profile)

  // Get semantic score
  let semanticScore = 0
  if (options.useSemanticMatching !== false) {
    const scholarshipEmbedding = scholarshipEmbeddings.get(scholarship.id)
    if (scholarshipEmbedding && profileEmbedding.length > 0) {
      const similarity = cosineSimilarity(profileEmbedding, scholarshipEmbedding)
      semanticScore = Math.round(similarity * 100)

      // Add semantic match reason if significant
      if (semanticScore > 60) {
        matchReasons.push(`Strong semantic match (${semanticScore}%)`)
      }
    }
  }

  // Weighted combination
  const finalScore = alpha * eligibilityScore + beta * semanticScore

  return {
    eligibilityScore,
    semanticScore,
    finalScore: Math.round(finalScore),
    matchReasons
  }
}
```

**Step 2.3: Update main handler**
```typescript
// Modified handler with hybrid scoring option

export async function handler(request: HttpRequest): Promise<HttpResponseInit> {
  const body = await request.json() as StudentProfile & {
    useSemanticMatching?: boolean
  }

  const scholarships = await loadApprovedScholarships()
  const embeddings = await loadEmbeddings()

  // Build embedding lookup map
  const embeddingMap = new Map<string, number[]>()
  for (const e of embeddings) {
    embeddingMap.set(e.id, e.embedding)
  }

  // Get profile embedding if semantic matching requested
  let profileEmbedding: number[] = []
  if (body.useSemanticMatching) {
    profileEmbedding = await getProfileEmbedding(body)
  }

  // Score all scholarships
  const scored = await Promise.all(
    scholarships.map(async (s) => {
      const scores = await hybridScoreScholarship(
        s, body, profileEmbedding, embeddingMap,
        { useSemanticMatching: body.useSemanticMatching }
      )
      return {
        ...s,
        matchScore: scores.finalScore,
        eligibilityScore: scores.eligibilityScore,
        semanticScore: scores.semanticScore,
        matchReasons: scores.matchReasons
      }
    })
  )

  // Filter and sort
  const filtered = scored
    .filter(s => s.matchScore >= 20)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 20)

  return {
    status: 200,
    jsonBody: {
      recommendations: filtered,
      totalMatches: filtered.length,
      matchingStrategy: body.useSemanticMatching ? 'hybrid' : 'rule-based'
    }
  }
}
```

**Learning Points:**
- How to combine deterministic and probabilistic scores
- Weight tuning (alpha/beta) for different use cases
- Performance considerations (caching, parallel processing)

---

### Phase 3: "You Might Also Like" Feature (Advanced)
**Goal:** Surface scholarships that are semantically related but may not pass strict eligibility

**Files to Modify:**
- `api/src/functions/recommendations.ts`
- `client/src/pages/student/StudentRecommendations.tsx`

**Backend Implementation:**
```typescript
// Add to recommendations.ts

async function getSemanticSuggestions(
  profile: StudentProfile,
  profileEmbedding: number[],
  excludeIds: Set<string>,
  scholarships: Scholarship[],
  embeddingMap: Map<string, number[]>,
  limit: number = 5
): Promise<ScoredScholarship[]> {
  // Get all scholarships sorted by semantic similarity
  const withSimilarity = scholarships
    .filter(s => !excludeIds.has(s.id))
    .map(s => {
      const embedding = embeddingMap.get(s.id)
      const similarity = embedding
        ? cosineSimilarity(profileEmbedding, embedding)
        : 0
      return { ...s, semanticScore: Math.round(similarity * 100) }
    })
    .filter(s => s.semanticScore > 40) // Minimum relevance threshold
    .sort((a, b) => b.semanticScore - a.semanticScore)
    .slice(0, limit)

  // Add eligibility warnings
  return withSimilarity.map(s => {
    const { reasons } = scoreScholarship(s, profile)
    const warnings = getEligibilityWarnings(s, profile)
    return {
      ...s,
      matchScore: s.semanticScore,
      matchReasons: [`Semantically similar (${s.semanticScore}%)`],
      eligibilityWarnings: warnings
    }
  })
}

function getEligibilityWarnings(scholarship: Scholarship, profile: StudentProfile): string[] {
  const warnings: string[] = []

  if (profile.income && scholarship.eligibility.maxIncome) {
    const income = parseInt(profile.income)
    if (income > scholarship.eligibility.maxIncome) {
      warnings.push(`Income limit: ₹${scholarship.eligibility.maxIncome.toLocaleString()}`)
    }
  }

  if (profile.state && !scholarship.eligibility.states.includes('all')) {
    if (!scholarship.eligibility.states.includes(profile.state)) {
      warnings.push(`Limited to: ${scholarship.eligibility.states.join(', ')}`)
    }
  }

  // Add more warning checks...

  return warnings
}
```

**Updated Response Format:**
```typescript
// Response now includes semantic suggestions
{
  recommendations: ScoredScholarship[],
  semanticSuggestions: ScoredScholarship[], // NEW
  totalMatches: number,
  matchingStrategy: 'hybrid' | 'rule-based'
}
```

**Learning Points:**
- Serendipitous discovery through semantic search
- Balancing strict eligibility vs. exploratory suggestions
- How to communicate uncertainty (warnings) to users

---

### Phase 4: Enhanced Profile Understanding (Bonus)
**Goal:** Use LLM to understand free-text profile narratives

**New Feature:** Allow students to describe their goals in free text

```typescript
// api/src/shared/profileEnhancement.ts

import { getChatCompletion, getEmbedding } from './openai'

interface EnhancedProfile extends StudentProfile {
  narrative?: string  // Free-text description of goals
  extractedKeywords?: string[]
}

export async function enhanceProfileWithNarrative(
  profile: EnhancedProfile
): Promise<{ enrichedText: string; keywords: string[] }> {
  if (!profile.narrative) {
    return {
      enrichedText: profileToText(profile),
      keywords: []
    }
  }

  // Use LLM to extract keywords and intent from narrative
  const extractionPrompt = `
    Extract scholarship-relevant keywords from this student's description:
    "${profile.narrative}"

    Return as JSON: { "keywords": [...], "fields": [...], "goals": [...] }
  `

  const response = await getChatCompletion([
    { role: 'system', content: 'You extract keywords for scholarship matching.' },
    { role: 'user', content: extractionPrompt }
  ])

  const extracted = JSON.parse(response)

  // Combine structured profile with extracted narrative elements
  const enrichedText = [
    profileToText(profile),
    `Interested in: ${extracted.fields.join(', ')}`,
    `Goals: ${extracted.goals.join(', ')}`,
    `Keywords: ${extracted.keywords.join(', ')}`
  ].join('. ')

  return { enrichedText, keywords: extracted.keywords }
}
```

**Learning Points:**
- Using LLMs for structured extraction
- Multi-modal input (structured + free text)
- Chain-of-thought prompting

---

## Frontend Changes

### Updated StudentRecommendations.tsx
```tsx
// Add toggle for semantic matching
const [useSemanticMatching, setUseSemanticMatching] = useState(false)
const [semanticSuggestions, setSemanticSuggestions] = useState<Scholarship[]>([])

// Fetch with semantic option
const fetchRecommendations = async () => {
  const response = await getRecommendations({
    ...studentProfile,
    useSemanticMatching
  })
  setRecommendations(response.recommendations)
  setSemanticSuggestions(response.semanticSuggestions || [])
}

// UI for toggle
<Switch
  checked={useSemanticMatching}
  onChange={setUseSemanticMatching}
  label="Enable AI-powered semantic matching"
/>

// Separate section for semantic suggestions
{semanticSuggestions.length > 0 && (
  <section>
    <h2>You Might Also Like</h2>
    <p className="text-sm text-gray-600">
      Based on your profile, these scholarships might interest you
      (check eligibility carefully)
    </p>
    {semanticSuggestions.map(s => (
      <ScholarshipCard
        key={s.id}
        scholarship={s}
        showWarnings={true}
      />
    ))}
  </section>
)}
```

---

## Testing Strategy

### Unit Tests
```typescript
// api/src/__tests__/hybridScoring.test.ts

describe('Hybrid Scoring', () => {
  it('should combine eligibility and semantic scores correctly', async () => {
    const result = await hybridScoreScholarship(
      mockScholarship,
      mockProfile,
      mockProfileEmbedding,
      mockEmbeddingMap,
      { alpha: 0.7 }
    )

    expect(result.finalScore).toBe(
      Math.round(0.7 * result.eligibilityScore + 0.3 * result.semanticScore)
    )
  })

  it('should fall back to rule-based when embeddings unavailable', async () => {
    const result = await hybridScoreScholarship(
      mockScholarship,
      mockProfile,
      [], // No profile embedding
      new Map(), // No scholarship embeddings
    )

    expect(result.finalScore).toBe(result.eligibilityScore)
  })
})
```

### Integration Tests
```typescript
// Test the full recommendation flow
describe('Recommendations API', () => {
  it('should return hybrid results when semantic matching enabled', async () => {
    const response = await request(app)
      .post('/api/recommendations')
      .send({
        state: 'Karnataka',
        category: 'General',
        educationLevel: 'undergraduate',
        useSemanticMatching: true
      })

    expect(response.body.matchingStrategy).toBe('hybrid')
    expect(response.body.recommendations[0]).toHaveProperty('semanticScore')
  })
})
```

---

## Configuration & Tuning

### Weight Configuration
Create a config file for easy experimentation:

```typescript
// api/src/config/scoring.ts

export const SCORING_CONFIG = {
  // Hybrid scoring weights
  ELIGIBILITY_WEIGHT: 0.7,  // alpha
  SEMANTIC_WEIGHT: 0.3,     // beta

  // Thresholds
  MIN_RECOMMENDATION_SCORE: 20,
  MIN_SEMANTIC_SUGGESTION_SCORE: 40,

  // Limits
  MAX_RECOMMENDATIONS: 20,
  MAX_SEMANTIC_SUGGESTIONS: 5,

  // Feature flags
  ENABLE_SEMANTIC_BY_DEFAULT: false,
  ENABLE_PROFILE_NARRATIVE: false,
}
```

---

## Hackathon Learning Checklist

### RAG Concepts
- [ ] Understand embedding dimensions (1536 for Ada-002)
- [ ] Implement cosine similarity from scratch
- [ ] Learn about chunking strategies (not needed here but good to know)
- [ ] Understand retrieval vs. generation phases

### Semantic Matching
- [ ] Convert structured data to embeddable text
- [ ] Experiment with different text representations
- [ ] Understand similarity thresholds and their meaning
- [ ] Learn about embedding space visualization

### Hybrid Systems
- [ ] Combine deterministic rules with probabilistic AI
- [ ] Tune weight parameters for different outcomes
- [ ] Handle graceful degradation when AI fails
- [ ] Measure and compare different approaches

### Azure OpenAI Specifics
- [ ] Understand rate limits and quotas
- [ ] Implement caching for embeddings
- [ ] Handle API errors gracefully
- [ ] Monitor costs and usage

---

## Quick Start Commands

```bash
# Generate/regenerate embeddings
cd api && npx ts-node src/scripts/generateEmbeddings.ts

# Run API locally
cd api && npm run start

# Run tests
cd api && npm test

# Test semantic endpoint manually
curl -X POST http://localhost:7071/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"state":"Karnataka","category":"General","useSemanticMatching":true}'
```

---

## Success Metrics

1. **Quality**: Side-by-side comparison of rule-based vs hybrid recommendations
2. **Relevance**: User feedback on "You Might Also Like" suggestions
3. **Performance**: Measure latency impact of embedding generation
4. **Learning**: Document what you learned about each concept

---

## Resources for Deep Dive

- [Azure OpenAI Embeddings](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/understand-embeddings)
- [Cosine Similarity Explained](https://www.pinecone.io/learn/cosine-similarity/)
- [RAG Pattern](https://www.pinecone.io/learn/retrieval-augmented-generation/)
- [Hybrid Search Strategies](https://www.pinecone.io/learn/hybrid-search/)
