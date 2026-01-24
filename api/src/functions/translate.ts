import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { translateText, detectLanguage } from '../shared/translator.js'

async function translate(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Translate endpoint called')

  try {
    const body = await request.json() as {
      text?: string
      from?: string
      to?: string
    }

    if (!body.text) {
      return {
        status: 400,
        jsonBody: { error: 'text field is required' }
      }
    }

    if (!body.to) {
      return {
        status: 400,
        jsonBody: { error: 'to field is required (target language code, e.g., "hi" or "en")' }
      }
    }

    // If 'from' not specified, detect the language
    let fromLanguage = body.from
    let detectedLanguage: string | undefined

    if (!fromLanguage) {
      detectedLanguage = await detectLanguage(body.text)
      fromLanguage = detectedLanguage
    }

    // Don't translate if source and target are the same
    if (fromLanguage === body.to) {
      return {
        status: 200,
        jsonBody: {
          translatedText: body.text,
          from: fromLanguage,
          to: body.to,
          detectedLanguage
        }
      }
    }

    const result = await translateText(body.text, fromLanguage, body.to)

    return {
      status: 200,
      jsonBody: {
        translatedText: result.translatedText,
        from: fromLanguage,
        to: body.to,
        detectedLanguage: detectedLanguage || result.detectedLanguage
      }
    }
  } catch (error: any) {
    context.error('Translate endpoint error:', error)
    return {
      status: 500,
      jsonBody: { error: 'Translation failed', details: error.message }
    }
  }
}

app.http('translate', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: translate
})
