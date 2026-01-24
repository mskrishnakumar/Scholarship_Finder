const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

interface ChatResponse {
  message: string
  conversationId: string
  language: string
  scholarshipsFound: number
}

interface GuidedFlowOption {
  value: string
  label: string
}

interface GuidedFlowStepResponse {
  step: string
  stepIndex?: number
  totalSteps?: number
  question?: string
  options?: GuidedFlowOption[]
  totalResults?: number
  results?: ScholarshipResult[]
}

export interface ScholarshipResult {
  id: string
  name: string
  description: string
  benefits: string
  deadline: string
  applicationSteps: string[]
  requiredDocuments: string[]
  officialUrl: string
}

interface TranslateResponse {
  translatedText: string
  from: string
  to: string
  detectedLanguage?: string
}

export interface StudentProfileData {
  state?: string
  category?: string
  educationLevel?: string
  income?: string
  gender?: string
  disability?: boolean
  course?: string
}

export async function sendChatMessage(
  message: string,
  conversationId?: string,
  language?: string,
  userId?: string,
  studentProfile?: StudentProfileData
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversationId, language, userId, studentProfile })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Chat request failed')
  }
  return res.json()
}

export async function sendGuidedFlowStep(
  step: string,
  answers: Record<string, string>,
  language: string
): Promise<GuidedFlowStepResponse> {
  const res = await fetch(`${API_BASE}/guided-flow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step, answers, language })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Guided flow request failed')
  }
  return res.json()
}

export async function translateText(
  text: string,
  to: string,
  from?: string
): Promise<TranslateResponse> {
  const res = await fetch(`${API_BASE}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, to, from })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Translation failed')
  }
  return res.json()
}

// --- Scholarship CRUD Types ---

export type ScholarshipType = 'public' | 'private'
export type ScholarshipStatus = 'approved' | 'pending' | 'rejected'

export interface ScholarshipFull {
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
  type: ScholarshipType
  donorId?: string
  donorName?: string
  status: ScholarshipStatus
  createdAt: string
  updatedAt: string
}

export interface CreateScholarshipRequest {
  name: string
  description: string
  eligibility?: ScholarshipFull['eligibility']
  benefits?: string
  deadline?: string
  applicationSteps?: string[]
  requiredDocuments?: string[]
  officialUrl?: string
  type?: ScholarshipType
  status?: ScholarshipStatus
  donorName?: string
}

export interface ScholarshipFilters {
  type?: ScholarshipType
  status?: ScholarshipStatus
  donorId?: string
}

export interface UserInfo {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
}

// --- Auth Headers Helper ---

function getAuthHeaders(userId: string, userRole: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-user-id': userId,
    'x-user-role': userRole
  }
}

// --- Scholarship CRUD Functions ---

export async function createScholarship(
  data: CreateScholarshipRequest,
  userId: string,
  userRole: string
): Promise<ScholarshipFull> {
  const res = await fetch(`${API_BASE}/scholarships`, {
    method: 'POST',
    headers: getAuthHeaders(userId, userRole),
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to create scholarship')
  }
  return res.json()
}

export async function getScholarships(
  filters: ScholarshipFilters,
  userId: string,
  userRole: string
): Promise<ScholarshipFull[]> {
  const params = new URLSearchParams()
  if (filters.type) params.set('type', filters.type)
  if (filters.status) params.set('status', filters.status)
  if (filters.donorId) params.set('donorId', filters.donorId)

  const res = await fetch(`${API_BASE}/scholarships?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(userId, userRole)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to fetch scholarships')
  }
  return res.json()
}

export async function updateScholarship(
  id: string,
  data: Partial<CreateScholarshipRequest>,
  userId: string,
  userRole: string
): Promise<ScholarshipFull> {
  const res = await fetch(`${API_BASE}/scholarships/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(userId, userRole),
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to update scholarship')
  }
  return res.json()
}

export async function deleteScholarship(
  id: string,
  userId: string,
  userRole: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/scholarships/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(userId, userRole)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to delete scholarship')
  }
}

export async function updateScholarshipStatus(
  id: string,
  status: ScholarshipStatus,
  userId: string,
  userRole: string
): Promise<ScholarshipFull> {
  const res = await fetch(`${API_BASE}/scholarships/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(userId, userRole),
    body: JSON.stringify({ status })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to update status')
  }
  return res.json()
}

// --- Recommendations API ---

export interface RecommendedScholarship {
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

export interface RecommendationsResponse {
  recommendations: RecommendedScholarship[]
  totalMatches: number
}

export async function getRecommendations(
  profile: StudentProfileData
): Promise<RecommendationsResponse> {
  const res = await fetch(`${API_BASE}/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to get recommendations')
  }
  return res.json()
}

// --- Users API ---

export async function getUsers(
  userId: string,
  userRole: string,
  roleFilter?: string
): Promise<{ users: UserInfo[]; total: number }> {
  const params = new URLSearchParams()
  if (roleFilter) params.set('role', roleFilter)

  const res = await fetch(`${API_BASE}/users?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(userId, userRole)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to fetch users')
  }
  return res.json()
}
