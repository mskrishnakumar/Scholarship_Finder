import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { UserRole } from '../context/AuthContext'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash (Supabase puts tokens there)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          setError(sessionError.message)
          return
        }

        if (!session) {
          setError('No session found. Please try signing in again.')
          return
        }

        const user = session.user
        const role = (searchParams.get('role') as UserRole) || 'student'

        // Check if user already has a role set (returning user)
        const existingRole = user.user_metadata?.role as UserRole | undefined

        if (existingRole) {
          // Returning user - redirect based on their existing role
          const profileComplete = user.user_metadata?.profileComplete ?? false
          if (existingRole === 'student' && !profileComplete) {
            navigate('/student/onboarding', { replace: true })
          } else if (existingRole === 'student') {
            navigate('/student', { replace: true })
          } else if (existingRole === 'donor') {
            navigate('/donor', { replace: true })
          } else if (existingRole === 'admin') {
            navigate('/admin', { replace: true })
          }
        } else {
          // New user - set their role and redirect to onboarding
          const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || ''

          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              role,
              name,
              profileComplete: false,
            }
          })

          if (updateError) {
            setError(updateError.message)
            return
          }

          // Redirect to onboarding for new students
          if (role === 'student') {
            navigate('/student/onboarding', { replace: true })
          } else if (role === 'donor') {
            navigate('/donor', { replace: true })
          } else {
            navigate('/student', { replace: true })
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      }
    }

    handleCallback()
  }, [navigate, searchParams])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-amber-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login/student')}
            className="w-full bg-teal-700 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-teal-800 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-amber-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}
