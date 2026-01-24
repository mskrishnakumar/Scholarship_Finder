import { AzureOpenAI } from 'openai'

let client: AzureOpenAI | null = null

export function getOpenAIClient(): AzureOpenAI {
  if (!client) {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT
    const apiKey = process.env.AZURE_OPENAI_KEY

    if (!endpoint || !apiKey) {
      throw new Error('AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY must be set')
    }

    client = new AzureOpenAI({
      endpoint,
      apiKey,
      apiVersion: '2024-04-01-preview'
    })
  }
  return client
}

export async function getChatCompletion(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  deployment?: string
): Promise<string> {
  const openai = getOpenAIClient()
  const deploymentName = deployment || process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4'

  const response = await openai.chat.completions.create({
    model: deploymentName,
    messages,
    max_tokens: 1024,
    temperature: 0.7
  })

  return response.choices[0]?.message?.content || ''
}

export async function getEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAIClient()
  const deploymentName = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-ada-002'

  const response = await openai.embeddings.create({
    model: deploymentName,
    input: text
  })

  return response.data[0].embedding
}
