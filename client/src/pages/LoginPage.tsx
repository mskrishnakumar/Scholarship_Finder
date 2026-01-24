import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../context/AuthContext'
import LanguageToggle from '../components/LanguageToggle'

export default function LoginPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { signUp, signIn, user, role } = useAuth()

  const getRoleHome = (r: UserRole | null) => {
    if (r === 'donor') return '/donor'
    if (r === 'admin') return '/admin'
    return '/student'
  }

  const [mode, setMode] = useState<'signup' | 'signin'>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // If already authenticated, redirect to role-appropriate dashboard
  if (user) {
    navigate(getRoleHome(role))
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
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-amber-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-700 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              {t('Mission Possible', 'मिशन पॉसिबल', 'மிஷன் பாசிபிள்', 'మిషన్ పాసిబుల్')}
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
                    ? 'border-teal-700 text-teal-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('Sign Up', 'साइन अप', 'பதிவு செய்', 'సైన్ అప్')}
              </button>
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null) }}
                className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
                  mode === 'signin'
                    ? 'border-teal-700 text-teal-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('Sign In', 'साइन इन', 'உள்நுழை', 'సైన్ ఇన్')}
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              {mode === 'signup'
                ? t('Create an account to find scholarships.', 'छात्रवृत्ति खोजने के लिए एक खाता बनाएं।', 'உதவித்தொகைகளைக் கண்டறிய ஒரு கணக்கை உருவாக்கவும்.', 'స్కాలర్‌షిప్‌లను కనుగొనడానికి ఖాతాను సృష్టించండి.')
                : t('Sign in to your account.', 'अपने खाते में साइन इन करें।', 'உங்கள் கணக்கில் உள்நுழையவும்.', 'మీ ఖాతాలో సైన్ ఇన్ చేయండి.')
              }
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Full Name', 'पूरा नाम', 'முழு பெயர்', 'పూర్తి పేరు')}
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-shadow text-sm"
                    placeholder={t('Enter your name', 'अपना नाम दर्ज करें', 'உங்கள் பெயரை உள்ளிடவும்', 'మీ పేరును నమోదు చేయండి')}
                    required
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Email', 'ईमेल', 'மின்னஞ்சல்', 'ఇమెయిల్')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-shadow text-sm"
                  placeholder={t('you@example.com', 'you@example.com', 'you@example.com', 'you@example.com')}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Password', 'पासवर्ड', 'கடவுச்சொல்', 'పాస్‌వర్డ్')}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-shadow text-sm"
                  placeholder={t('Enter your password', 'अपना पासवर्ड दर्ज करें', 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்', 'మీ పాస్‌వర్డ్ నమోదు చేయండి')}
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
                className="w-full bg-teal-700 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-teal-800 focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? t('Please wait...', 'कृपया प्रतीक्षा करें...', 'தயவுசெய்து காத்திருங்கள்...', 'దయచేసి వేచి ఉండండి...')
                  : mode === 'signup'
                    ? t('Create Account', 'खाता बनाएं', 'கணக்கை உருவாக்கு', 'ఖాతాను సృష్టించండి')
                    : t('Sign In', 'साइन इन', 'உள்நுழை', 'సైన్ ఇన్')
                }
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {t('← Back to home', '← होम पर वापस जाएं', '← முகப்புக்குத் திரும்பு', '← హోమ్‌కు తిరిగి వెళ్ళు')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
