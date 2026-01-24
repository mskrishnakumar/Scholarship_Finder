import { useNavigate, Navigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import LanguageToggle from '../components/LanguageToggle'

export default function LandingPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/student" replace />
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
        <div className="max-w-3xl w-full text-center">
          {/* Hero Section */}
          <div className="mb-10">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('Find Scholarships You Deserve', 'आपके लायक छात्रवृत्ति खोजें')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t(
                'Discover government schemes and scholarships tailored to your eligibility. Get step-by-step guidance to apply — in English or Hindi.',
                'अपनी पात्रता के अनुसार सरकारी योजनाएं और छात्रवृत्तियां खोजें। आवेदन के लिए चरण-दर-चरण मार्गदर्शन प्राप्त करें — अंग्रेज़ी या हिंदी में।'
              )}
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => navigate(user ? '/student' : '/login')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            {t('Start Finding Scholarships', 'छात्रवृत्ति खोजना शुरू करें')}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          {/* Features */}
          <div className="mt-16 grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-white/70 backdrop-blur rounded-xl p-6 border border-white/50">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {t('Chat with AI', 'AI से चैट करें')}
              </h3>
              <p className="text-sm text-gray-600">
                {t(
                  'Ask questions in natural language and get personalized scholarship recommendations.',
                  'प्राकृतिक भाषा में प्रश्न पूछें और व्यक्तिगत छात्रवृत्ति अनुशंसाएं प्राप्त करें।'
                )}
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur rounded-xl p-6 border border-white/50">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {t('Guided Search', 'निर्देशित खोज')}
              </h3>
              <p className="text-sm text-gray-600">
                {t(
                  'Answer simple questions to find schemes matching your eligibility.',
                  'अपनी पात्रता से मेल खाने वाली योजनाएं खोजने के लिए सरल प्रश्नों के उत्तर दें।'
                )}
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur rounded-xl p-6 border border-white/50">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {t('Bilingual Support', 'द्विभाषी सहायता')}
              </h3>
              <p className="text-sm text-gray-600">
                {t(
                  'Use the app in English or Hindi — switch anytime.',
                  'अंग्रेज़ी या हिंदी में ऐप का उपयोग करें — कभी भी स्विच करें।'
                )}
              </p>
            </div>
          </div>

          {/* Admin link */}
          <div className="mt-12">
            <button
              onClick={() => navigate('/admin')}
              className="text-sm text-gray-500 hover:text-gray-700 underline-offset-2 hover:underline"
            >
              {t('Admin access', 'एडमिन एक्सेस')}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-500">
        {t('Built for Magic Bus Hackathon', 'Magic Bus हैकथॉन के लिए बनाया गया')}
      </footer>
    </div>
  )
}
