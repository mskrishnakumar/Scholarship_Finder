import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import LanguageToggle from '../components/LanguageToggle'

export default function LoginPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { signUp, signIn, user } = useAuth()

  const [mode, setMode] = useState<'signup' | 'signin'>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // If already authenticated, redirect to student dashboard
  if (user) {
    navigate('/student')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    let result: { error: string | null }

    if (mode === 'signup') {
      result = await signUp(email, password, name)
    } else {
      result = await signIn(email, password)
    }

    setSubmitting(false)

    if (result.error) {
      setError(result.error)
    } else {
      navigate('/student')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              {t('Scholarship Finder', 'छात्रवृत्ति खोजक')}
            </h1>
          </div>
          <LanguageToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 animate-[fadeIn_0.3s_ease-out]">
            {/* Tabs */}
            <div className="flex mb-6 border-b border-gray-200">
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null) }}
                className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
                  mode === 'signup'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('Sign Up', 'साइन अप')}
              </button>
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null) }}
                className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
                  mode === 'signin'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('Sign In', 'साइन इन')}
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              {mode === 'signup'
                ? t('Create an account to find scholarships.', 'छात्रवृत्ति खोजने के लिए एक खाता बनाएं।')
                : t('Sign in to your account.', 'अपने खाते में साइन इन करें।')
              }
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Full Name', 'पूरा नाम')}
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-sm"
                    placeholder={t('Enter your name', 'अपना नाम दर्ज करें')}
                    required
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Email', 'ईमेल')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-sm"
                  placeholder={t('you@example.com', 'you@example.com')}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Password', 'पासवर्ड')}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-sm"
                  placeholder={t('Enter your password', 'अपना पासवर्ड दर्ज करें')}
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? t('Please wait...', 'कृपया प्रतीक्षा करें...')
                  : mode === 'signup'
                    ? t('Create Account', 'खाता बनाएं')
                    : t('Sign In', 'साइन इन')
                }
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {t('← Back to home', '← होम पर वापस जाएं')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
