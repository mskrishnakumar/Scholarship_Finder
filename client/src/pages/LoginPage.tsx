import { useState } from 'react'
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../context/AuthContext'
import LanguageToggle from '../components/LanguageToggle'

interface LoginPageProps {
  pageRole: UserRole
}

export default function LoginPage({ pageRole }: LoginPageProps) {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { signUp, signIn, signInWithGoogle, user, role, profileComplete } = useAuth()

  const [mode, setMode] = useState<'signup' | 'signin'>(pageRole === 'admin' ? 'signin' : 'signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Donor org field - only organization name at signup
  const [orgName, setOrgName] = useState('')

  const getPostLoginRedirect = (r: UserRole | null, isProfileComplete: boolean) => {
    if (r === 'student' && !isProfileComplete) return '/student/onboarding'
    if (r === 'student') return '/student'
    if (r === 'donor') return '/donor'
    if (r === 'admin') return '/admin'
    return '/student'
  }

  if (user) {
    return <Navigate to={getPostLoginRedirect(role, profileComplete)} replace />
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setGoogleLoading(true)
    const result = await signInWithGoogle(pageRole)
    if (result.error) {
      setError(result.error)
      setGoogleLoading(false)
    }
    // If successful, user will be redirected to Google OAuth
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    let result: { error: string | null }

    if (mode === 'signup') {
      const extraData: Record<string, unknown> = {}
      if (pageRole === 'donor') {
        if (!orgName.trim()) {
          setError(t('Organization name is required', 'संगठन का नाम आवश्यक है', 'நிறுவனத்தின் பெயர் தேவை', 'సంస్థ పేరు అవసరం'))
          setSubmitting(false)
          return
        }
        extraData.organizationName = orgName.trim()
        // donorProfileComplete will be set to true when they fill out the full profile in the portal
        extraData.donorProfileComplete = false
      }
      result = await signUp(email, password, name, pageRole, extraData)
    } else {
      result = await signIn(email, password)
    }

    setSubmitting(false)
    if (result.error) {
      setError(result.error)
    }
  }

  const roleLabel = pageRole === 'student'
    ? t('Student', 'छात्र', 'மாணவர்', 'విద్యార్థి')
    : pageRole === 'donor'
      ? t('Donor', 'दानदाता', 'நன்கொடையாளர்', 'దాత')
      : t('Admin', 'व्यवस्थापक', 'நிர்வாகி', 'అడ్మిన్')

  const switchRoleLink = pageRole === 'student'
    ? { to: '/login/donor', label: t('Not a student? Sign up as Donor', 'छात्र नहीं हैं? दानदाता के रूप में साइन अप करें', 'மாணவர் இல்லையா? நன்கொடையாளராக பதிவு செய்யவும்', 'విద్యార్థి కాదా? దాతగా సైన్ అప్ చేయండి') }
    : pageRole === 'donor'
      ? { to: '/login/student', label: t('Not a donor? Sign up as Student', 'दानदाता नहीं हैं? छात्र के रूप में साइन अप करें', 'நன்கொடையாளர் இல்லையா? மாணவராக பதிவு செய்யவும்', 'దాత కాదా? విద్యార్థిగా సైన్ అప్ చేయండి') }
      : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-amber-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: pageRole === 'donor' ? '#b45309' : '#0f766e' }}
            >
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
            {/* Role Header */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: pageRole === 'donor' ? '#fef3c7' : pageRole === 'admin' ? '#ede9fe' : '#ccfbf1',
                  color: pageRole === 'donor' ? '#92400e' : pageRole === 'admin' ? '#6b21a8' : '#115e59'
                }}
              >
                {roleLabel}
              </span>
            </div>

            {/* Tabs - not shown for admin (sign-in only) */}
            {pageRole !== 'admin' && (
              <div className="flex mb-6 border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null) }}
                  className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
                    mode === 'signup'
                      ? (pageRole === 'donor' ? 'border-amber-600 text-amber-700' : 'border-teal-700 text-teal-700')
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
                      ? (pageRole === 'donor' ? 'border-amber-600 text-amber-700' : 'border-teal-700 text-teal-700')
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t('Sign In', 'साइन इन', 'உள்நுழை', 'సైన్ ఇన్')}
                </button>
              </div>
            )}

            {/* Admin heading */}
            {pageRole === 'admin' && (
              <h2 className="text-center text-sm font-medium text-gray-700 mb-6">
                {t('Sign in to admin panel', 'एडमिन पैनल में साइन इन करें', 'நிர்வாக பேனலில் உள்நுழையவும்', 'అడ్మిన్ ప్యానెల్‌లో సైన్ ఇన్ చేయండి')}
              </h2>
            )}

            {/* Google OAuth - only for students (not admin or donor) */}
            {pageRole === 'student' && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {googleLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  {t('Continue with Google', 'Google से जारी रखें', 'Google உடன் தொடரவும்', 'Google తో కొనసాగించండి')}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">
                      {t('or', 'या', 'அல்லது', 'లేదా')}
                    </span>
                  </div>
                </div>

                {/* Email/Password section header */}
                <p className="text-sm text-gray-600 text-center mb-4">
                  {mode === 'signup'
                    ? t(
                        'Create a Scholarship Finder account',
                        'Scholarship Finder खाता बनाएं',
                        'Scholarship Finder கணக்கை உருவாக்கவும்',
                        'Scholarship Finder ఖాతాను సృష్టించండి'
                      )
                    : t(
                        'Sign in with your Scholarship Finder account',
                        'अपने Scholarship Finder खाते से साइन इन करें',
                        'உங்கள் Scholarship Finder கணக்கில் உள்நுழையவும்',
                        'మీ Scholarship Finder ఖాతాతో సైన్ ఇన్ చేయండి'
                      )
                  }
                </p>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name - signup only */}
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
                    className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 outline-none transition-shadow text-sm ${pageRole === 'donor' ? 'focus:ring-amber-500 focus:border-amber-500' : 'focus:ring-teal-600 focus:border-teal-600'}`}
                    placeholder={t('Enter your name', 'अपना नाम दर्ज करें', 'உங்கள் பெயரை உள்ளிடவும்', 'మీ పేరును నమోదు చేయండి')}
                    required
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Email', 'ईमेल', 'மின்னஞ்சல்', 'ఇమెయిల్')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 outline-none transition-shadow text-sm ${pageRole === 'donor' ? 'focus:ring-amber-500 focus:border-amber-500' : 'focus:ring-teal-600 focus:border-teal-600'}`}
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  {mode === 'signup'
                    ? t('Create Password', 'पासवर्ड बनाएं', 'கடவுச்சொல்லை உருவாக்கு', 'పాస్‌వర్డ్ సృష్టించండి')
                    : t('Password', 'पासवर्ड', 'கடவுச்சொல்', 'పాస్‌వర్డ్')}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 outline-none transition-shadow text-sm ${pageRole === 'donor' ? 'focus:ring-amber-500 focus:border-amber-500' : 'focus:ring-teal-600 focus:border-teal-600'}`}
                  placeholder={mode === 'signup'
                    ? t('Create a new password', 'एक नया पासवर्ड बनाएं', 'புதிய கடவுச்சொல்லை உருவாக்கவும்', 'కొత్త పాస్‌వర్డ్ సృష్టించండి')
                    : t('Enter your password', 'अपना पासवर्ड दर्ज करें', 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்', 'మీ పాస్‌వర్డ్ నమోదు చేయండి')}
                  required
                  minLength={6}
                />
                {mode === 'signup' && (
                  <p className="mt-1.5 text-xs text-gray-500">
                    {t(
                      'This password is only for Scholarship Finder (not your Google or email password). Minimum 6 characters.',
                      'यह पासवर्ड केवल Scholarship Finder के लिए है (आपका Google या ईमेल पासवर्ड नहीं)। न्यूनतम 6 अक्षर।',
                      'இந்த கடவுச்சொல் Scholarship Finder க்கு மட்டுமே (உங்கள் Google அல்லது மின்னஞ்சல் கடவுச்சொல் அல்ல). குறைந்தபட்சம் 6 எழுத்துக்கள்.',
                      'ఈ పాస్‌వర్డ్ Scholarship Finder కోసం మాత్రమే (మీ Google లేదా ఇమెయిల్ పాస్‌వర్డ్ కాదు). కనీసం 6 అక్షరాలు.'
                    )}
                  </p>
                )}
              </div>

              {/* Donor Organization Name - signup only */}
              {mode === 'signup' && pageRole === 'donor' && (
                <div>
                  <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Organization Name', 'संगठन का नाम', 'நிறுவனத்தின் பெயர்', 'సంస్థ పేరు')} *
                  </label>
                  <input
                    id="orgName"
                    type="text"
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-shadow text-sm"
                    placeholder={t('Enter organization name', 'संगठन का नाम दर्ज करें', 'நிறுவனத்தின் பெயரை உள்ளிடவும்', 'సంస్థ పేరును నమోదు చేయండి')}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    {t(
                      'You can complete your full organization profile after signing up.',
                      'साइन अप के बाद आप अपनी पूरी संगठन प्रोफ़ाइल पूरी कर सकते हैं।',
                      'பதிவு செய்த பிறகு உங்கள் முழு நிறுவன விவரங்களை பூர்த்தி செய்யலாம்.',
                      'సైన్ అప్ చేసిన తర్వాత మీ పూర్తి సంస్థ ప్రొఫైల్‌ను పూర్తి చేయవచ్చు.'
                    )}
                  </p>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full text-white py-2.5 px-4 rounded-lg font-medium focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: pageRole === 'donor' ? '#d97706' : '#0f766e',
                }}
              >
                {submitting
                  ? t('Please wait...', 'कृपया प्रतीक्षा करें...', 'தயவுசெய்து காத்திருங்கள்...', 'దయచేసి వేచి ఉండండి...')
                  : mode === 'signup'
                    ? t('Create Account', 'खाता बनाएं', 'கணக்கை உருவாக்கு', 'ఖాతాను సృష్టించండి')
                    : t('Sign In', 'साइन इन', 'உள்நுழை', 'సైన్ ఇన్')
                }
              </button>
            </form>

            {/* Switch role link */}
            {switchRoleLink && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate(switchRoleLink.to)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  {switchRoleLink.label}
                </button>
              </div>
            )}

            <div className="mt-3 text-center">
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

/**
 * Backward-compat redirect: /login?role=X → /login/X
 */
export function LoginRedirect() {
  const [searchParams] = useSearchParams()
  const urlRole = searchParams.get('role')
  if (urlRole === 'donor') return <Navigate to="/login/donor" replace />
  if (urlRole === 'admin') return <Navigate to="/login/admin" replace />
  return <Navigate to="/login/student" replace />
}
