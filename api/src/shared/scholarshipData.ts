import { readFileSync } from 'fs'
import { join } from 'path'
import { EmbeddingRecord, findTopK } from './embeddings.js'
import { getEmbedding } from './openai.js'

export interface Scholarship {
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
  deadline: string
  applicationSteps: string[]
  requiredDocuments: string[]
  officialUrl: string
}

let scholarships: Scholarship[] | null = null
let embeddings: EmbeddingRecord[] | null = null

function getDataPath(): string {
  return join(__dirname, '..', '..', 'data')
}

export function loadScholarships(): Scholarship[] {
  if (!scholarships) {
    const filePath = join(getDataPath(), 'scholarships.json')
    const data = readFileSync(filePath, 'utf-8')
    scholarships = JSON.parse(data) as Scholarship[]
  }
  return scholarships
}

export function loadEmbeddings(): EmbeddingRecord[] {
  if (!embeddings) {
    const filePath = join(getDataPath(), 'embeddings.json')
    try {
      const data = readFileSync(filePath, 'utf-8')
      embeddings = JSON.parse(data) as EmbeddingRecord[]
    } catch {
      embeddings = []
    }
  }
  return embeddings
}

export async function searchScholarships(
  query: string,
  topK: number = 5
): Promise<Scholarship[]> {
  const allScholarships = loadScholarships()
  const allEmbeddings = loadEmbeddings()

  if (allEmbeddings.length === 0) {
    // Fallback: return all scholarships if no embeddings available
    return allScholarships.slice(0, topK)
  }

  try {
    const queryEmbedding = await getEmbedding(query)
    const topResults = findTopK(queryEmbedding, allEmbeddings, topK)

    const resultIds = new Set(topResults.map(r => r.id))
    return allScholarships.filter(s => resultIds.has(s.id))
  } catch {
    // Fallback: return first N scholarships if embedding generation fails
    return allScholarships.slice(0, topK)
  }
}

export interface GuidedFlowFilters {
  state?: string
  category?: string
  income?: number
  educationLevel?: string
  gender?: string
  disability?: boolean
  religion?: string
  area?: string
  course?: string
}

export function filterScholarships(filters: GuidedFlowFilters): Scholarship[] {
  const allScholarships = loadScholarships()

  return allScholarships.filter(scholarship => {
    const elig = scholarship.eligibility

    // State filter
    if (filters.state && !elig.states.includes('all') && !elig.states.includes(filters.state)) {
      return false
    }

    // Category filter
    if (filters.category) {
      const categories = Array.isArray(elig.categories) ? elig.categories : [elig.categories]
      if (!categories.includes('all') && !categories.includes(filters.category)) {
        return false
      }
    }

    // Income filter
    if (filters.income !== undefined && elig.maxIncome !== null && filters.income > elig.maxIncome) {
      return false
    }

    // Education level filter
    if (filters.educationLevel && !elig.educationLevels.includes(filters.educationLevel)) {
      return false
    }

    // Gender filter
    if (filters.gender && elig.gender !== 'all' && elig.gender !== filters.gender) {
      return false
    }

    // Disability filter
    if (filters.disability !== undefined && elig.disability && !filters.disability) {
      return false
    }

    // Religion filter
    if (filters.religion) {
      const religions = Array.isArray(elig.religion) ? elig.religion : [elig.religion]
      if (!religions.includes('all') && !religions.includes(filters.religion)) {
        return false
      }
    }

    // Area filter
    if (filters.area && elig.area !== 'all' && elig.area !== filters.area) {
      return false
    }

    // Course filter
    if (filters.course && !elig.courses.includes('all') && !elig.courses.includes(filters.course)) {
      return false
    }

    return true
  })
}
