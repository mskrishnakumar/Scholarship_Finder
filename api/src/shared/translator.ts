import axios from 'axios'

interface TranslationResult {
  translatedText: string
  detectedLanguage?: string
}

export async function translateText(
  text: string,
  from: string,
  to: string
): Promise<TranslationResult> {
  const key = process.env.AZURE_TRANSLATOR_KEY
  const endpoint = process.env.AZURE_TRANSLATOR_ENDPOINT
  const region = process.env.AZURE_TRANSLATOR_REGION

  if (!key || !endpoint || !region) {
    throw new Error('Azure Translator environment variables must be set (AZURE_TRANSLATOR_KEY, AZURE_TRANSLATOR_ENDPOINT, AZURE_TRANSLATOR_REGION)')
  }

  const url = `${endpoint}/translate?api-version=3.0&from=${from}&to=${to}`

  const response = await axios.post(
    url,
    [{ text }],
    {
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Ocp-Apim-Subscription-Region': region,
        'Content-Type': 'application/json'
      }
    }
  )

  const translation = response.data[0]
  return {
    translatedText: translation.translations[0].text,
    detectedLanguage: translation.detectedLanguage?.language
  }
}

export async function detectLanguage(text: string): Promise<string> {
  const key = process.env.AZURE_TRANSLATOR_KEY
  const endpoint = process.env.AZURE_TRANSLATOR_ENDPOINT
  const region = process.env.AZURE_TRANSLATOR_REGION

  if (!key || !endpoint || !region) {
    throw new Error('Azure Translator environment variables must be set')
  }

  const url = `${endpoint}/detect?api-version=3.0`

  const response = await axios.post(
    url,
    [{ text }],
    {
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Ocp-Apim-Subscription-Region': region,
        'Content-Type': 'application/json'
      }
    }
  )

  return response.data[0].language
}
