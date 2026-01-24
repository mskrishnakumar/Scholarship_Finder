import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import LanguageToggle from '../components/LanguageToggle'
import { INDIAN_STATES } from '../constants/states'

export default function LoginPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { signUp, user } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [state, setState] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
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

    const result = await signUp(email, name, state)
    setSubmitting(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSent(true)
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
          {sent ? (
            /* Success: Magic link sent */
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center animate-[fadeIn_0.3s_ease-out]">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('Check your email!', 'अपना ईमेल देखें!')}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t(
                  `We've sent a magic link to ${email}. Click the link in your email to sign in.`,
                  `हमने ${email} पर एक मैजिक लिंक भेजा है। साइन इन करने के लिए अपने ईमेल में लिंक पर क्लिक करें।`
                )}
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                {t('Try a different email', 'दूसरा ईमेल आज़माएं')}
              </button>
            </div>
          ) : (
            /* Registration Form */
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 animate-[fadeIn_0.3s_ease-out]">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {t('Get Started', 'शुरू करें')}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {t(
                  "Enter your details and we'll send you a magic link to sign in.",
                  'अपना विवरण दर्ज करें और हम आपको साइन इन करने के लिए एक मैजिक लिंक भेजेंगे।'
                )}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('State', 'राज्य')}
                  </label>
                  <select
                    id="state"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-sm bg-white"
                    required
                  >
                    <option value="">{t('Select your state', 'अपना राज्य चुनें')}</option>
                    {INDIAN_STATES.map(s => (
                      <option key={s.en} value={s.en}>{s.en}</option>
                    ))}
                  </select>
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
                    ? t('Sending...', 'भेज रहे हैं...')
                    : t('Send Magic Link', 'मैजिक लिंक भेजें')}
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
          )}
        </div>
      </main>
    </div>
  )
}
