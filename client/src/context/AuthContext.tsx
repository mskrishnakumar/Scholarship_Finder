import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type UserRole = 'student' | 'donor' | 'admin'

export interface UserProfile {
  name: string
  state: string
  role: UserRole
  category?: string
  educationLevel?: string
  income?: string
  gender?: string
  disability?: boolean
  religion?: string
  area?: string
  course?: string
  // Donor-specific fields
  organizationName?: string
  organizationType?: string
  designation?: string
  organizationWebsite?: string
  focusAreas?: string[]
  geographicPreference?: string[]
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  role: UserRole | null
  profileComplete: boolean
  donorProfileComplete: boolean
  loading: boolean
  signUp: (email: string, password: string, name: string, role?: UserRole, extraData?: Record<string, unknown>) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signInWithGoogle: (role?: UserRole) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  updateProfile: (data: Record<string, unknown>) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const role: UserRole | null = user?.user_metadata?.role || (user ? 'student' : null)
  const profileComplete: boolean = user?.user_metadata?.profileComplete ?? false
  const donorProfileComplete: boolean = user?.user_metadata?.donorProfileComplete ?? false

  const profile: UserProfile | null = user?.user_metadata
    ? {
        name: user.user_metadata.name || '',
        state: user.user_metadata.state || '',
        role: (user.user_metadata.role as UserRole) || 'student',
        category: user.user_metadata.category,
        educationLevel: user.user_metadata.educationLevel,
        income: user.user_metadata.income,
        gender: user.user_metadata.gender,
        disability: user.user_metadata.disability,
        religion: user.user_metadata.religion,
        area: user.user_metadata.area,
        course: user.user_metadata.course
      }
    : null

  const signUp = async (email: string, password: string, name: string, role: UserRole = 'student', extraData?: Record<string, unknown>): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role, ...extraData }
      }
    })
    if (error) {
      return { error: error.message }
    }
    return { error: null }
  }

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) {
      return { error: error.message }
    }
    return { error: null }
  }

  const signInWithGoogle = async (role: UserRole = 'student'): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    if (error) {
      return { error: error.message }
    }
    return { error: null }
  }

  const signOut = async () => {
    // Sign out from all tabs/windows with scope: 'global'
    const { error } = await supabase.auth.signOut({ scope: 'global' })
    if (error) {
      console.error('Sign out error:', error)
    }
    // Clear local state (onAuthStateChange will also trigger, but this ensures immediate update)
    setUser(null)
    setSession(null)
  }

  const updateProfile = async (data: Record<string, unknown>): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.updateUser({
      data
    })
    if (error) {
      return { error: error.message }
    }
    return { error: null }
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, role, profileComplete, donorProfileComplete, loading, signUp, signIn, signInWithGoogle, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
