import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { supabaseAdmin } from '../shared/supabaseAdmin.js'
import { requireRole, AuthError } from '../shared/auth.js'

async function listUsers(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  try {
    requireRole(request, ['admin'])

    const { data, error } = await supabaseAdmin.auth.admin.listUsers()
    if (error) {
      return { status: 500, jsonBody: { error: error.message } }
    }

    let users = data.users.map(u => ({
      id: u.id,
      email: u.email || '',
      name: (u.user_metadata?.name as string) || '',
      role: (u.user_metadata?.role as string) || 'student',
      createdAt: u.created_at
    }))

    const roleFilter = request.query.get('role')
    if (roleFilter) {
      users = users.filter(u => u.role === roleFilter)
    }

    return { status: 200, jsonBody: { users, total: users.length } }
  } catch (err) {
    if (err instanceof AuthError) return { status: err.statusCode, jsonBody: { error: err.message } }
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

app.http('listUsers', { methods: ['GET'], route: 'users', authLevel: 'anonymous', handler: listUsers })
