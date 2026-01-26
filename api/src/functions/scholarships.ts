import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { randomUUID } from 'crypto'
import { loadAllScholarships, savePrivateScholarship, deletePrivateScholarship, Scholarship } from '../shared/scholarshipData.js'
import { requireRole, AuthError } from '../shared/auth.js'
import { generateAndSaveScholarshipEmbedding, removeScholarshipEmbedding } from '../shared/scholarshipEmbedding.js'

async function createScholarship(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const user = requireRole(request, ['donor', 'admin'])
    const body = await request.json() as Partial<Scholarship>

    if (!body.name || !body.description) {
      return { status: 400, jsonBody: { error: 'name and description are required' } }
    }

    const now = new Date().toISOString()
    const scholarship: Scholarship = {
      id: randomUUID(),
      name: body.name,
      description: body.description,
      eligibility: body.eligibility || {
        states: ['all'],
        categories: ['all'],
        maxIncome: null,
        educationLevels: [],
        gender: 'all',
        disability: false,
        religion: 'all',
        area: 'all',
        courses: []
      },
      benefits: body.benefits || '',
      deadline: body.deadline || '',
      applicationSteps: body.applicationSteps || [],
      requiredDocuments: body.requiredDocuments || [],
      officialUrl: body.officialUrl || '',
      type: user.role === 'donor' ? 'private' : (body.type || 'public'),
      donorId: user.role === 'donor' ? user.id : (body.donorId || user.id),
      donorName: body.donorName || '',
      status: user.role === 'donor' ? 'pending' : (body.status || 'approved'),
      createdAt: now,
      updatedAt: now
    }

    savePrivateScholarship(scholarship)

    // Generate embedding on-demand if scholarship is approved
    // This runs async and doesn't block the response
    if (scholarship.status === 'approved') {
      generateAndSaveScholarshipEmbedding(scholarship).catch(err => {
        console.error(`Failed to generate embedding for new scholarship ${scholarship.id}:`, err)
      })
    }

    return { status: 201, jsonBody: scholarship }
  } catch (err) {
    if (err instanceof AuthError) return { status: err.statusCode, jsonBody: { error: err.message } }
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

async function listScholarships(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const user = requireRole(request, ['donor', 'admin'])
    let results = loadAllScholarships()

    const typeFilter = request.query.get('type')
    const statusFilter = request.query.get('status')
    const donorIdFilter = request.query.get('donorId')

    if (typeFilter) results = results.filter(s => s.type === typeFilter)
    if (statusFilter) results = results.filter(s => s.status === statusFilter)
    if (donorIdFilter) results = results.filter(s => s.donorId === donorIdFilter)

    // Donors can only see their own
    if (user.role === 'donor') {
      results = results.filter(s => s.donorId === user.id)
    }

    return { status: 200, jsonBody: results }
  } catch (err) {
    if (err instanceof AuthError) return { status: err.statusCode, jsonBody: { error: err.message } }
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

async function updateScholarship(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const user = requireRole(request, ['donor', 'admin'])
    const id = request.params.id
    const all = loadAllScholarships()
    const existing = all.find(s => s.id === id)

    if (!existing) return { status: 404, jsonBody: { error: 'Not found' } }
    if (user.role === 'donor' && existing.donorId !== user.id) {
      return { status: 403, jsonBody: { error: 'Forbidden' } }
    }

    const body = await request.json() as Partial<Scholarship>
    const updated: Scholarship = {
      ...existing,
      ...body,
      id: existing.id,
      donorId: existing.donorId,
      updatedAt: new Date().toISOString()
    }

    savePrivateScholarship(updated)

    // Regenerate embedding if scholarship is approved (content may have changed)
    if (updated.status === 'approved') {
      generateAndSaveScholarshipEmbedding(updated).catch(err => {
        console.error(`Failed to regenerate embedding for scholarship ${updated.id}:`, err)
      })
    }

    return { status: 200, jsonBody: updated }
  } catch (err) {
    if (err instanceof AuthError) return { status: err.statusCode, jsonBody: { error: err.message } }
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

async function removeScholarship(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const user = requireRole(request, ['donor', 'admin'])
    const id = request.params.id
    const all = loadAllScholarships()
    const existing = all.find(s => s.id === id)

    if (!existing) return { status: 404, jsonBody: { error: 'Not found' } }
    if (user.role === 'donor' && existing.donorId !== user.id) {
      return { status: 403, jsonBody: { error: 'Forbidden' } }
    }

    deletePrivateScholarship(id)

    // Remove embedding when scholarship is deleted
    removeScholarshipEmbedding(id)

    return { status: 204 }
  } catch (err) {
    if (err instanceof AuthError) return { status: err.statusCode, jsonBody: { error: err.message } }
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

async function updateStatus(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  try {
    requireRole(request, ['admin'])
    const id = request.params.id
    const all = loadAllScholarships()
    const existing = all.find(s => s.id === id)

    if (!existing) return { status: 404, jsonBody: { error: 'Not found' } }

    const body = await request.json() as { status: 'approved' | 'pending' | 'rejected' }
    if (!['approved', 'pending', 'rejected'].includes(body.status)) {
      return { status: 400, jsonBody: { error: 'Invalid status' } }
    }

    const updated: Scholarship = { ...existing, status: body.status, updatedAt: new Date().toISOString() }
    savePrivateScholarship(updated)

    // Generate embedding when scholarship is newly approved
    if (body.status === 'approved' && existing.status !== 'approved') {
      generateAndSaveScholarshipEmbedding(updated).catch(err => {
        console.error(`Failed to generate embedding for approved scholarship ${updated.id}:`, err)
      })
    }
    // Remove embedding if scholarship is rejected or moved to pending
    else if (body.status !== 'approved' && existing.status === 'approved') {
      removeScholarshipEmbedding(updated.id)
    }

    return { status: 200, jsonBody: updated }
  } catch (err) {
    if (err instanceof AuthError) return { status: err.statusCode, jsonBody: { error: err.message } }
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

app.http('createScholarship', { methods: ['POST'], route: 'scholarships', authLevel: 'anonymous', handler: createScholarship })
app.http('listScholarships', { methods: ['GET'], route: 'scholarships', authLevel: 'anonymous', handler: listScholarships })
app.http('updateScholarship', { methods: ['PUT'], route: 'scholarships/{id}', authLevel: 'anonymous', handler: updateScholarship })
app.http('deleteScholarship', { methods: ['DELETE'], route: 'scholarships/{id}', authLevel: 'anonymous', handler: removeScholarship })
app.http('updateScholarshipStatus', { methods: ['PATCH'], route: 'scholarships/{id}/status', authLevel: 'anonymous', handler: updateStatus })
