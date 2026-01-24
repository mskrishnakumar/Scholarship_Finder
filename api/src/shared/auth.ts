import { HttpRequest } from '@azure/functions'
import { UserRole } from './types.js'

export interface RequestUser {
  id: string
  role: UserRole
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message)
    this.name = 'AuthError'
  }
}

export function getRequestUser(request: HttpRequest): RequestUser | null {
  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role') as UserRole | null
  if (!userId || !userRole) return null
  if (!['student', 'donor', 'admin'].includes(userRole)) return null
  return { id: userId, role: userRole }
}

export function requireRole(request: HttpRequest, allowedRoles: UserRole[]): RequestUser {
  const user = getRequestUser(request)
  if (!user) throw new AuthError('Authentication required', 401)
  if (!allowedRoles.includes(user.role)) throw new AuthError('Forbidden', 403)
  return user
}
