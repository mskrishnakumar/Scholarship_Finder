import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { requireRole, AuthError } from '../shared/auth.js'
import {
  getSavedScholarshipsForUser,
  saveScholarshipForUser,
  unsaveScholarshipForUser,
  SavedScholarshipData
} from '../shared/tableStorage.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
}

/**
 * GET /api/saved-scholarships - List user's saved scholarships
 */
async function listSavedScholarships(
  request: HttpRequest,
  _context: InvocationContext
): Promise<HttpResponseInit> {
  // Handle preflight
  if (request.method === 'OPTIONS') {
    return { status: 204, headers: CORS_HEADERS }
  }

  try {
    const user = requireRole(request, ['student'])

    const savedScholarships = await getSavedScholarshipsForUser(user.id)

    // Transform to match frontend expectations
    const scholarships = savedScholarships.map(record => ({
      ...record.scholarshipData,
      id: record.scholarshipId,
      savedAt: record.savedAt
    }))

    return {
      status: 200,
      headers: CORS_HEADERS,
      jsonBody: { scholarships, total: scholarships.length }
    }
  } catch (err) {
    if (err instanceof AuthError) {
      return { status: err.statusCode, headers: CORS_HEADERS, jsonBody: { error: err.message } }
    }
    console.error('listSavedScholarships error:', err)
    return {
      status: 500,
      headers: CORS_HEADERS,
      jsonBody: { error: err instanceof Error ? err.message : 'Internal server error' }
    }
  }
}

/**
 * POST /api/saved-scholarships/{id} - Save a scholarship
 */
async function saveScholarship(
  request: HttpRequest,
  _context: InvocationContext
): Promise<HttpResponseInit> {
  // Handle preflight
  if (request.method === 'OPTIONS') {
    return { status: 204, headers: CORS_HEADERS }
  }

  try {
    const user = requireRole(request, ['student'])
    const scholarshipId = request.params.id

    if (!scholarshipId) {
      return {
        status: 400,
        headers: CORS_HEADERS,
        jsonBody: { error: 'Scholarship ID is required' }
      }
    }

    // Get scholarship data from request body
    const body = await request.json() as SavedScholarshipData

    if (!body.name || !body.benefits || !body.deadline) {
      return {
        status: 400,
        headers: CORS_HEADERS,
        jsonBody: { error: 'Scholarship data (name, benefits, deadline) is required' }
      }
    }

    const scholarshipData: SavedScholarshipData = {
      id: scholarshipId,
      name: body.name,
      description: body.description || '',
      benefits: body.benefits,
      deadline: body.deadline,
      officialUrl: body.officialUrl,
      type: body.type || 'public'
    }

    await saveScholarshipForUser(user.id, scholarshipId, scholarshipData)

    return {
      status: 201,
      headers: CORS_HEADERS,
      jsonBody: { success: true, message: 'Scholarship saved' }
    }
  } catch (err) {
    if (err instanceof AuthError) {
      return { status: err.statusCode, headers: CORS_HEADERS, jsonBody: { error: err.message } }
    }
    console.error('saveScholarship error:', err)
    return {
      status: 500,
      headers: CORS_HEADERS,
      jsonBody: { error: err instanceof Error ? err.message : 'Internal server error' }
    }
  }
}

/**
 * DELETE /api/saved-scholarships/{id} - Unsave a scholarship
 */
async function unsaveScholarship(
  request: HttpRequest,
  _context: InvocationContext
): Promise<HttpResponseInit> {
  // Handle preflight
  if (request.method === 'OPTIONS') {
    return { status: 204, headers: CORS_HEADERS }
  }

  try {
    const user = requireRole(request, ['student'])
    const scholarshipId = request.params.id

    if (!scholarshipId) {
      return {
        status: 400,
        headers: CORS_HEADERS,
        jsonBody: { error: 'Scholarship ID is required' }
      }
    }

    const deleted = await unsaveScholarshipForUser(user.id, scholarshipId)

    if (!deleted) {
      return {
        status: 404,
        headers: CORS_HEADERS,
        jsonBody: { error: 'Saved scholarship not found' }
      }
    }

    return {
      status: 200,
      headers: CORS_HEADERS,
      jsonBody: { success: true, message: 'Scholarship unsaved' }
    }
  } catch (err) {
    if (err instanceof AuthError) {
      return { status: err.statusCode, headers: CORS_HEADERS, jsonBody: { error: err.message } }
    }
    console.error('unsaveScholarship error:', err)
    return {
      status: 500,
      headers: CORS_HEADERS,
      jsonBody: { error: err instanceof Error ? err.message : 'Internal server error' }
    }
  }
}

// Register endpoints
app.http('listSavedScholarships', {
  methods: ['GET', 'OPTIONS'],
  route: 'saved-scholarships',
  authLevel: 'anonymous',
  handler: listSavedScholarships
})

app.http('saveScholarship', {
  methods: ['POST', 'OPTIONS'],
  route: 'saved-scholarships/{id}',
  authLevel: 'anonymous',
  handler: saveScholarship
})

app.http('unsaveScholarship', {
  methods: ['DELETE', 'OPTIONS'],
  route: 'saved-scholarships/{id}',
  authLevel: 'anonymous',
  handler: unsaveScholarship
})
