import { useNavigate, Navigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../context/AuthContext'
import LanguageToggle from '../components/LanguageToggle'

export default function LandingPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user, role } = useAuth()

  const getRoleHome = (r: UserRole | null) => {
    if (r === 'donor') return '/donor'
    if (r === 'admin') return '/admin'
    return '/student'
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
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('Every Student Deserves a Chance', 'हर छात्र एक मौका पाने का हकदार है', 'ஒவ்வொரு மாணவரும் ஒரு வாய்ப்புக்கு தகுதியானவர்', 'ప్రతి విద్యార్థి ఒక అవకాశానికి అర్హుడు')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t(
                'Find scholarships, fund education, or manage the platform.',
                'छात्रवृत्ति खोजें, शिक्षा को फंड करें, या प्लेटफॉर्म प्रबंधित करें।',
                'உதவித்தொகைகளைக் கண்டறியுங்கள், கல்விக்கு நிதியளியுங்கள் அல்லது தளத்தை நிர்வகியுங்கள்.',
                'స్కాలర్‌షిప్‌లను కనుగొనండి, విద్యకు నిధులు అందించండి లేదా ప్లాట్‌ఫారమ్‌ను నిర్వహించండి.'
              )}
            </p>
          </div>

          {/* 3 Role Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Student Card */}
            <button
              onClick={() => navigate('/login?role=student')}
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
              onClick={() => navigate('/login?role=donor')}
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
              onClick={() => navigate('/login?role=admin')}
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
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-500">
        {t('Empowering students to find their path', 'छात्रों को उनका मार्ग खोजने में सशक्त बनाना', 'மாணவர்களுக்கு வழி காட்டுதல்', 'విద్యార్థులకు వారి మార్గం కనుగొనడంలో సహాయం')}
      </footer>
    </div>
  )
}
