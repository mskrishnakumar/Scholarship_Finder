import { useEffect, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../context/AuthContext'
import LanguageToggle from '../components/LanguageToggle'
import { supabase } from '../lib/supabase'

export default function LandingPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user, role, loading: authLoading } = useAuth()
  const [processingOAuth, setProcessingOAuth] = useState(false)

  const getRoleHome = (r: UserRole | null) => {
    if (r === 'donor') return '/donor'
    if (r === 'admin') return '/admin'
    return '/student'
  }

  // Handle OAuth callback tokens that land on root URL
  // This happens when Supabase redirects to /#access_token=... instead of /auth/callback
  useEffect(() => {
    const handleOAuthOnRoot = async () => {
      const hash = window.location.hash
      if (hash && hash.includes('access_token=')) {
        setProcessingOAuth(true)
        try {
          // Supabase will automatically pick up tokens from the hash
          const { data: { session }, error } = await supabase.auth.getSession()

          if (error) {
            console.error('OAuth error:', error)
            setProcessingOAuth(false)
            return
          }

          if (session) {
            const existingRole = session.user.user_metadata?.role as UserRole | undefined
            const profileComplete = session.user.user_metadata?.profileComplete ?? false

            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname)

            if (existingRole) {
              // Returning user - redirect based on their role
              if (existingRole === 'student' && !profileComplete) {
                navigate('/student/onboarding', { replace: true })
              } else {
                navigate(getRoleHome(existingRole), { replace: true })
              }
            } else {
              // New user - set role to student (default for OAuth landing on root)
              const name = session.user.user_metadata?.full_name ||
                          session.user.user_metadata?.name ||
                          session.user.email?.split('@')[0] || ''

              await supabase.auth.updateUser({
                data: {
                  role: 'student',
                  name,
                  profileComplete: false,
                }
              })
              navigate('/student/onboarding', { replace: true })
            }
          }
        } catch (err) {
          console.error('OAuth processing error:', err)
        }
        setProcessingOAuth(false)
      }
    }

    handleOAuthOnRoot()
  }, [navigate])

  // Show loading while processing OAuth or auth state
  if (processingOAuth || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">
            {processingOAuth ? 'Completing sign in...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  if (user) {
    return <Navigate to={getRoleHome(role)} replace />
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
        <div className="max-w-4xl w-full text-center">
          {/* Hero Section */}
          <div className="mb-12">
            {/* AI-Powered and BETA badges */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
                {t('AI-Powered', 'AI-संचालित', 'AI-இயக்கப்படும்', 'AI-ఆధారిత')}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                BETA
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('Every Student Deserves a Chance', 'हर छात्र एक मौका पाने का हकदार है', 'ஒவ்வொரு மாணவரும் ஒரு வாய்ப்புக்கு தகுதியானவர்', 'ప్రతి విద్యార్థి ఒక అవకాశానికి అర్హుడు')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t(
                'An AI-powered platform that matches students with scholarships they qualify for. Built by volunteers, powered by AI. This is our beta - help us make it better!',
                'एक AI-संचालित प्लेटफॉर्म जो छात्रों को उनकी योग्यता के अनुसार छात्रवृत्ति से जोड़ता है। स्वयंसेवकों द्वारा निर्मित, AI द्वारा संचालित। यह हमारा बीटा है - इसे बेहतर बनाने में मदद करें!',
                'மாணவர்களை அவர்கள் தகுதியான உதவித்தொகைகளுடன் இணைக்கும் AI-இயக்கப்படும் தளம். தன்னார்வலர்களால் உருவாக்கப்பட்டது, AI மூலம் இயக்கப்படுகிறது. இது எங்கள் பீட்டா - இதை மேம்படுத்த உதவுங்கள்!',
                'విద్యార్థులను వారు అర్హమైన స్కాలర్‌షిప్‌లతో అనుసంధానించే AI-ఆధారిత ప్లాట్‌ఫారమ్. వాలంటీర్లచే నిర్మించబడింది, AI ద్వారా నడుస్తుంది. ఇది మా బీటా - దీన్ని మెరుగుపరచడంలో సహాయపడండి!'
              )}
            </p>
          </div>

          {/* 3 Role Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Student Card */}
            <button
              onClick={() => navigate('/login/student')}
              className="bg-white rounded-2xl p-8 border-2 border-teal-200 hover:border-teal-500 hover:shadow-lg transition-all text-left group"
            >
              <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors">
                <svg className="w-7 h-7 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t("I'm a Student", 'मैं एक छात्र हूं', 'நான் ஒரு மாணவர்', 'నేను విద్యార్థిని')}
              </h3>
              <p className="text-sm text-gray-600">
                {t("Find scholarships you're eligible for", 'अपनी पात्रता अनुसार छात्रवृत्ति खोजें', 'நீங்கள் தகுதியான உதவித்தொகைகளைக் கண்டறியுங்கள்', 'మీకు అర్హమైన స్కాలర్‌షిప్‌లను కనుగొనండి')}
              </p>
            </button>

            {/* Donor Card */}
            <button
              onClick={() => navigate('/login/donor')}
              className="bg-white rounded-2xl p-8 border-2 border-amber-200 hover:border-amber-500 hover:shadow-lg transition-all text-left group"
            >
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
                <svg className="w-7 h-7 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t("I'm a Donor", 'मैं एक दानदाता हूं', 'நான் ஒரு நன்கொடையாளர்', 'నేను దాతను')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('Fund scholarships for deserving students', 'योग्य छात्रों के लिए छात्रवृत्ति फंड करें', 'தகுதியான மாணவர்களுக்கு உதவித்தொகை வழங்குங்கள்', 'అర్హమైన విద్యార్థులకు స్కాలర్‌షిప్‌లు అందించండి')}
              </p>
            </button>

            {/* Admin Card */}
            <button
              onClick={() => navigate('/login/admin')}
              className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-slate-500 hover:shadow-lg transition-all text-left group"
            >
              <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-colors">
                <svg className="w-7 h-7 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('Admin Access', 'एडमिन एक्सेस', 'நிர்வாக அணுகல்', 'అడ్మిన్ యాక్సెస్')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('Manage scholarships and users', 'छात्रवृत्ति और उपयोगकर्ता प्रबंधित करें', 'உதவித்தொகைகள் மற்றும் பயனர்களை நிர்வகியுங்கள்', 'స్కాలర్‌షిప్‌లు మరియు వినియోగదారులను నిర్వహించండి')}
              </p>
            </button>
          </div>

          {/* Why Mission Possible? Section */}
          <div className="mt-16">
            <h3 className="text-xl font-semibold text-gray-700 mb-8">
              {t('Why Mission Possible?', 'मिशन पॉसिबल क्यों?', 'மிஷன் பாசிபிள் ஏன்?', 'మిషన్ పాసిబుల్ ఎందుకు?')}
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              {/* AI-Powered Matching */}
              <div className="bg-white/70 rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {t('AI-Powered Matching', 'AI-संचालित मिलान', 'AI-இயக்கப்படும் பொருத்தம்', 'AI-ఆధారిత మ్యాచింగ్')}
                </h4>
                <p className="text-sm text-gray-600">
                  {t(
                    'Smart algorithms analyze your profile to find scholarships you qualify for',
                    'स्मार्ट एल्गोरिदम आपकी प्रोफ़ाइल का विश्लेषण करके योग्य छात्रवृत्ति खोजते हैं',
                    'ஸ்மார்ட் அல்காரிதம்கள் உங்கள் சுயவிவரத்தை பகுப்பாய்வு செய்து தகுதியான உதவித்தொகைகளைக் கண்டறியும்',
                    'స్మార్ట్ అల్గారిథమ్‌లు మీ ప్రొఫైల్‌ను విశ్లేషించి మీరు అర్హమైన స్కాలర్‌షిప్‌లను కనుగొంటాయి'
                  )}
                </p>
              </div>

              {/* 50+ Scholarships */}
              <div className="bg-white/70 rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {t('50+ Scholarships', '50+ छात्रवृत्तियां', '50+ உதவித்தொகைகள்', '50+ స్కాలర్‌షిప్‌లు')}
                </h4>
                <p className="text-sm text-gray-600">
                  {t(
                    'Growing database of scholarships across India, from government to private',
                    'सरकारी से लेकर निजी तक, पूरे भारत में छात्रवृत्तियों का बढ़ता डेटाबेस',
                    'அரசு முதல் தனியார் வரை, இந்தியா முழுவதும் உதவித்தொகைகளின் வளரும் தரவுத்தளம்',
                    'ప్రభుత్వం నుండి ప్రైవేట్ వరకు, భారతదేశం అంతటా స్కాలర్‌షిప్‌ల పెరుగుతున్న డేటాబేస్'
                  )}
                </p>
              </div>

              {/* Volunteer-Built */}
              <div className="bg-white/70 rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {t('Volunteer-Built', 'स्वयंसेवकों द्वारा निर्मित', 'தன்னார்வலர்களால் உருவாக்கப்பட்டது', 'వాలంటీర్లచే నిర్మించబడింది')}
                </h4>
                <p className="text-sm text-gray-600">
                  {t(
                    'Created by a dedicated team passionate about education access',
                    'शिक्षा तक पहुंच के प्रति समर्पित टीम द्वारा निर्मित',
                    'கல்வி அணுகலில் ஆர்வமுள்ள அர்ப்பணிப்புள்ள குழுவால் உருவாக்கப்பட்டது',
                    'విద్యా ప్రాప్యత పట్ల అంకితభావం కలిగిన బృందంచే సృష్టించబడింది'
                  )}
                </p>
              </div>

              {/* Your Feedback Matters */}
              <div className="bg-white/70 rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {t('Your Feedback Matters', 'आपकी प्रतिक्रिया मायने रखती है', 'உங்கள் கருத்து முக்கியம்', 'మీ అభిప్రాయం ముఖ్యం')}
                </h4>
                <p className="text-sm text-gray-600">
                  {t(
                    'Help us improve! Share bugs, ideas, or just say hello',
                    'हमें बेहतर बनाने में मदद करें! बग, विचार साझा करें या बस नमस्ते कहें',
                    'மேம்படுத்த உதவுங்கள்! பிழைகள், யோசனைகளைப் பகிரவும் அல்லது வணக்கம் சொல்லுங்கள்',
                    'మెరుగుపరచడంలో సహాయపడండి! బగ్‌లు, ఆలోచనలు పంచుకోండి లేదా హలో చెప్పండి'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500 border-t border-gray-200/50">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span>{t('Beta v0.1', 'बीटा v0.1', 'பீட்டா v0.1', 'బీటా v0.1')}</span>
          <span className="text-gray-300">|</span>
          <span>{t('Built by volunteers', 'स्वयंसेवकों द्वारा निर्मित', 'தன்னார்வலர்களால் உருவாக்கப்பட்டது', 'వాలంటీర్లచే నిర్మించబడింది')}</span>
          <span className="text-gray-300">|</span>
          <a
            href="https://github.com/mskrishnakumar/Scholarship_Finder/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 hover:text-teal-700 hover:underline"
          >
            {t('Share Feedback', 'प्रतिक्रिया दें', 'கருத்து தெரிவிக்கவும்', 'అభిప్రాయం పంచుకోండి')}
          </a>
        </div>
      </footer>
    </div>
  )
}
