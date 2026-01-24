import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { getChatCompletion } from '../shared/openai.js'
import { searchScholarships, Scholarship } from '../shared/scholarshipData.js'
import { translateText, detectLanguage } from '../shared/translator.js'
import { saveMessage } from '../shared/tableStorage.js'
import { randomUUID } from 'crypto'

const SYSTEM_PROMPT = `You are a helpful scholarship advisor for students in India. Your role is to help students from underserved communities discover government schemes and scholarships they are eligible for.

When responding:
- Provide clear, structured information about scholarships
- Include eligibility criteria, benefits, deadlines, and application steps
- Be encouraging and supportive
- If the student's query is vague, ask clarifying questions about their state, category, education level, income, etc.
- Always mention the official portal or website where they can apply
- Keep responses concise but informative

You will be given context about relevant scholarships. Use this context to provide accurate answers.`

function formatScholarshipContext(scholarships: Scholarship[]): string {
  return scholarships.map(s => {
    const states = s.eligibility.states.join(', ')
    const categories = Array.isArray(s.eligibility.categories) ? s.eligibility.categories.join(', ') : s.eligibility.categories
    return [
      `Name: ${s.name}`,
      `Description: ${s.description}`,
      `States: ${states}`,
      `Categories: ${categories}`,
      `Income Limit: ${s.eligibility.maxIncome ? `Rs. ${s.eligibility.maxIncome}` : 'None'}`,
      `Education Levels: ${s.eligibility.educationLevels.join(', ')}`,
      `Gender: ${s.eligibility.gender}`,
      `Benefits: ${s.benefits}`,
      `Deadline: ${s.deadline}`,
      `How to Apply: ${s.applicationSteps.join(' → ')}`,
      `Required Documents: ${s.requiredDocuments.join(', ')}`,
      `Official URL: ${s.officialUrl}`
    ].join('\n')
  }).join('\n\n---\n\n')
}

async function chat(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Chat endpoint called')

  try {
    const body = await request.json() as {
      message?: string
      conversationId?: string
      language?: string
      userId?: string
      studentProfile?: {
        state?: string
        category?: string
        educationLevel?: string
        income?: string
        gender?: string
        disability?: boolean
        course?: string
      }
    }

    if (!body.message) {
      return {
        status: 400,
        jsonBody: { error: 'message field is required' }
      }
    }

    const conversationId = body.conversationId || randomUUID()
    const userId = body.userId || 'anonymous'
    let userMessage = body.message
    let responseLanguage = body.language || 'en'

    // Detect language if not specified
    if (!body.language) {
      try {
        const detected = await detectLanguage(userMessage)
        if (detected === 'hi') {
          responseLanguage = 'hi'
        }
      } catch {
        // Default to English if detection fails
      }
    }

    // Translate Hindi input to English for processing
    let queryText = userMessage
    if (responseLanguage === 'hi') {
      try {
        const translated = await translateText(userMessage, 'hi', 'en')
        queryText = translated.translatedText
      } catch {
        // Use original text if translation fails
      }
    }

    // Enrich search query with profile keywords for better RAG results
    let enrichedQuery = queryText
    if (body.studentProfile?.category) {
      enrichedQuery = `${body.studentProfile.category} ${enrichedQuery}`
    }
    if (body.studentProfile?.educationLevel) {
      enrichedQuery = `${body.studentProfile.educationLevel} ${enrichedQuery}`
    }

    // Search for relevant scholarships using RAG
    const relevantScholarships = await searchScholarships(enrichedQuery, 5)
    const scholarshipContext = formatScholarshipContext(relevantScholarships)

    // Build profile context for system prompt
    let profileContext = ''
    if (body.studentProfile) {
      const p = body.studentProfile
      const parts: string[] = []
      if (p.state) parts.push(`from ${p.state}`)
      if (p.category) parts.push(`${p.category} category`)
      if (p.educationLevel) parts.push(`education level: ${p.educationLevel}`)
      if (p.income) parts.push(`family income: Rs. ${parseInt(p.income, 10).toLocaleString()}`)
      if (p.gender) parts.push(`gender: ${p.gender}`)
      if (p.course) parts.push(`interested in ${p.course}`)
      if (parts.length > 0) {
        profileContext = `\nStudent profile: ${parts.join(', ')}. Prioritize scholarships matching this profile.`
      }
    }
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT + profileContext },
      {
        role: 'system',
        content: `Here are the most relevant scholarships based on the student's query:\n\n${scholarshipContext}`
      },
      { role: 'user', content: queryText }
    ]

    // Get response from GPT
    let assistantResponse = await getChatCompletion(messages)

    // Translate response to Hindi if needed
    if (responseLanguage === 'hi') {
      try {
        const translated = await translateText(assistantResponse, 'en', 'hi')
        assistantResponse = translated.translatedText
      } catch {
        // Return English response if translation fails
      }
    }

    // Save messages to chat history (non-blocking)
    try {
      const timestamp = new Date().toISOString()
      await saveMessage({
        userId,
        conversationId,
        messageId: randomUUID(),
        role: 'user',
        content: userMessage,
        timestamp
      })
      await saveMessage({
        userId,
        conversationId,
        messageId: randomUUID(),
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date().toISOString()
      })
    } catch {
      // Don't fail the request if history save fails
      context.log('Warning: Failed to save chat history')
    }

    return {
      status: 200,
      jsonBody: {
        message: assistantResponse,
        conversationId,
        language: responseLanguage,
        scholarshipsFound: relevantScholarships.length
      }
    }
  } catch (error: any) {
    context.error('Chat endpoint error:', error)
    return {
      status: 500,
      jsonBody: { error: 'Internal server error', details: error.message }
    }
  }
}

app.http('chat', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: chat
})
