import { useState } from 'react'
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../context/AuthContext'
import LanguageToggle from '../components/LanguageToggle'
import { INDIAN_STATES } from '../constants/states'

const ORG_TYPES = [
  { value: 'corporate', labelKey: ['Corporate', 'कॉर्पोरेट', 'கார்ப்பரேட்', 'కార్పొరేట్'] },
  { value: 'ngo', labelKey: ['NGO / Foundation', 'एनजीओ / फाउंडेशन', 'என்ஜிஓ / அறக்கட்டளை', 'ఎన్జీవో / ఫౌండేషన్'] },
  { value: 'individual', labelKey: ['Individual Philanthropist', 'व्यक्तिगत परोपकारी', 'தனிநபர் பரோபகாரி', 'వ్యక్తిగత దాత'] },
  { value: 'trust', labelKey: ['Trust', 'ट्रस्ट', 'அறக்கட்டளை', 'ట్రస్ట్'] },
  { value: 'government', labelKey: ['Government Body', 'सरकारी निकाय', 'அரசு அமைப்பு', 'ప్రభుత్వ సంస్థ'] }
]

const FOCUS_AREAS = [
  { value: 'SC', labelKey: ['SC', 'अनुसूचित जाति', 'எஸ்சி', 'ఎస్సీ'] },
  { value: 'ST', labelKey: ['ST', 'अनुसूचित जनजाति', 'எஸ்டி', 'ఎస్టీ'] },
  { value: 'OBC', labelKey: ['OBC', 'अन्य पिछड़ा वर्ग', 'ஓபிசி', 'ఓబీసీ'] },
  { value: 'Minority', labelKey: ['Minority', 'अल्पसंख्यक', 'சிறுபான்மையினர்', 'మైనారిటీ'] },
  { value: 'General', labelKey: ['General', 'सामान्य', 'பொது', 'జనరల్'] },
  { value: 'Disability', labelKey: ['Disability', 'विकलांगता', 'மாற்றுத்திறன்', 'వికలాంగులు'] },
  { value: 'Women', labelKey: ['Women', 'महिला', 'பெண்கள்', 'మహిళలు'] }
]

interface LoginPageProps {
  pageRole: UserRole
}

export default function LoginPage({ pageRole }: LoginPageProps) {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { signUp, signIn, user, role, profileComplete } = useAuth()

  const [mode, setMode] = useState<'signup' | 'signin'>(pageRole === 'admin' ? 'signin' : 'signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Donor org fields
  const [orgName, setOrgName] = useState('')
  const [orgType, setOrgType] = useState('')
  const [designation, setDesignation] = useState('')
  const [orgWebsite, setOrgWebsite] = useState('')
  const [focusAreas, setFocusAreas] = useState<string[]>([])
  const [geoPref, setGeoPref] = useState<string[]>([])

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
        if (!orgType) {
          setError(t('Organization type is required', 'संगठन का प्रकार आवश्यक है', 'நிறுவன வகை தேவை', 'సంస్థ రకం అవసరం'))
          setSubmitting(false)
          return
        }
        extraData.organizationName = orgName.trim()
        extraData.organizationType = orgType
        if (designation.trim()) extraData.designation = designation.trim()
        if (orgWebsite.trim()) extraData.organizationWebsite = orgWebsite.trim()
        if (focusAreas.length > 0) extraData.focusAreas = focusAreas
        if (geoPref.length > 0) extraData.geographicPreference = geoPref
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

  const toggleFocusArea = (val: string) => {
    setFocusAreas(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  }

  const toggleGeoPref = (val: string) => {
    setGeoPref(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
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
                  {t('Password', 'पासवर्ड', 'கடவுச்சொல்', 'పాస్‌వర్డ్')}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 outline-none transition-shadow text-sm ${pageRole === 'donor' ? 'focus:ring-amber-500 focus:border-amber-500' : 'focus:ring-teal-600 focus:border-teal-600'}`}
                  placeholder={t('Enter your password', 'अपना पासवर्ड दर्ज करें', 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்', 'మీ పాస్‌వర్డ్ నమోదు చేయండి')}
                  required
                  minLength={6}
                />
              </div>

              {/* Donor Organization Fields - signup only */}
              {mode === 'signup' && pageRole === 'donor' && (
                <div className="border-t border-gray-200 pt-4 mt-4 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800">
                    {t('Organization Details', 'संगठन विवरण', 'நிறுவன விவரங்கள்', 'సంస్థ వివరాలు')}
                  </h3>

                  {/* Organization Name */}
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
                  </div>

                  {/* Organization Type */}
                  <div>
                    <label htmlFor="orgType" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Organization Type', 'संगठन का प्रकार', 'நிறுவன வகை', 'సంస్థ రకం')} *
                    </label>
                    <select
                      id="orgType"
                      value={orgType}
                      onChange={e => setOrgType(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-shadow text-sm bg-white"
                    >
                      <option value="">{t('Select type...', 'प्रकार चुनें...', 'வகையைத் தேர்ந்தெடுக்கவும்...', 'రకాన్ని ఎంచుకోండి...')}</option>
                      {ORG_TYPES.map(o => (
                        <option key={o.value} value={o.value}>{t(o.labelKey[0], o.labelKey[1], o.labelKey[2], o.labelKey[3])}</option>
                      ))}
                    </select>
                  </div>

                  {/* Designation */}
                  <div>
                    <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Your Designation', 'आपका पदनाम', 'உங்கள் பதவி', 'మీ హోదా')}
                    </label>
                    <input
                      id="designation"
                      type="text"
                      value={designation}
                      onChange={e => setDesignation(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-shadow text-sm"
                      placeholder={t('e.g. CSR Manager, Trustee', 'जैसे सीएसआर मैनेजर, ट्रस्टी', 'எ.கா. CSR மேலாளர், அறங்காவலர்', 'ఉదా. CSR మేనేజర్, ట్రస్టీ')}
                    />
                  </div>

                  {/* Organization Website */}
                  <div>
                    <label htmlFor="orgWebsite" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Organization Website', 'संगठन वेबसाइट', 'நிறுவன இணையதளம்', 'సంస్థ వెబ్‌సైట్')}
                    </label>
                    <input
                      id="orgWebsite"
                      type="url"
                      value={orgWebsite}
                      onChange={e => setOrgWebsite(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-shadow text-sm"
                      placeholder="https://example.org"
                    />
                  </div>

                  {/* Focus Areas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('Focus Areas', 'फोकस क्षेत्र', 'கவன பகுதிகள்', 'ఫోకస్ ఏరియాలు')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {FOCUS_AREAS.map(fa => (
                        <button
                          key={fa.value}
                          type="button"
                          onClick={() => toggleFocusArea(fa.value)}
                          className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                            focusAreas.includes(fa.value)
                              ? 'bg-amber-100 border-amber-300 text-amber-800'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {t(fa.labelKey[0], fa.labelKey[1], fa.labelKey[2], fa.labelKey[3])}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Geographic Preference */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('Geographic Preference', 'भौगोलिक प्राथमिकता', 'புவியியல் விருப்பம்', 'భౌగోళిక ప్రాధాన్యత')}
                    </label>
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                      {INDIAN_STATES.map(state => (
                        <label key={state} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={geoPref.includes(state)}
                            onChange={() => toggleGeoPref(state)}
                            className="w-3.5 h-3.5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                          />
                          <span className="text-xs text-gray-700">{state}</span>
                        </label>
                      ))}
                    </div>
                  </div>
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
