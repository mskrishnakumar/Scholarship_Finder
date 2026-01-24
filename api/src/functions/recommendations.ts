import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { loadApprovedScholarships, Scholarship } from '../shared/scholarshipData.js'

interface StudentProfile {
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
  matchReasons: string[]
}

function scoreScholarship(scholarship: Scholarship, profile: StudentProfile): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []
  const elig = scholarship.eligibility

  // State match (+15)
  if (profile.state) {
    if (elig.states.includes('all') || elig.states.includes(profile.state)) {
      score += 15
      if (!elig.states.includes('all')) {
        reasons.push(`Available in ${profile.state}`)
      }
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

async function recommendations(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Recommendations endpoint called')

  try {
    const body = await request.json() as StudentProfile

    const allScholarships = loadApprovedScholarships()

    const scored: ScoredScholarship[] = allScholarships
      .map(scholarship => {
        const { score, reasons } = scoreScholarship(scholarship, body)
        return {
          id: scholarship.id,
          name: scholarship.name,
          description: scholarship.description,
          benefits: scholarship.benefits,
          deadline: scholarship.deadline,
          applicationSteps: scholarship.applicationSteps,
          requiredDocuments: scholarship.requiredDocuments,
          officialUrl: scholarship.officialUrl,
          matchScore: score,
          matchReasons: reasons
        }
      })
      .filter(s => s.matchScore >= 20)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20)

    return {
      status: 200,
      jsonBody: {
        recommendations: scored,
        totalMatches: scored.length
      }
    }
  } catch (error: any) {
    context.error('Recommendations endpoint error:', error)
    return {
      status: 500,
      jsonBody: { error: 'Internal server error', details: error.message }
    }
  }
}

app.http('recommendations', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: recommendations
})
