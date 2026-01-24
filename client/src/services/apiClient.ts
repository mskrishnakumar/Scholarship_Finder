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

export async function sendChatMessage(
  message: string,
  conversationId?: string,
  language?: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversationId, language })
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
