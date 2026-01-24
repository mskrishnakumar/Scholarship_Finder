import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'

export default function DonorDashboard() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { profile, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {t('Mission Possible', 'मिशन पॉसिबल', 'மிஷன் பாசிபிள்', 'మిషన్ పాసిబుల్')}
              </h1>
              {profile?.name && (
                <span className="text-xs text-gray-500">{profile.name}</span>
              )}
            </div>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              {t('Donor', 'दानदाता', 'நன்கொடையாளர்', 'దాత')}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {t('Logout', 'लॉगआउट', 'வெளியேறு', 'లాగ్అవుట్')}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('Donor Dashboard', 'दानदाता डैशबोर्ड', 'நன்கொடையாளர் டாஷ்போர்டு', 'దాత డ్యాష్‌బోర్డ్')}
        </h2>
        <p className="text-gray-600 mb-8">
          {t('Manage your scholarships and track applications.', 'अपनी छात्रवृत्तियां प्रबंधित करें।', 'உங்கள் உதவித்தொகைகளை நிர்வகிக்கவும்.', 'మీ స్కాలర్‌షిప్‌లను నిర్వహించండి.')}
        </p>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-400 italic">
            {t('Donor features coming soon...', 'दानदाता सुविधाएं जल्द आ रही हैं...', 'நன்கொடையாளர் அம்சங்கள் விரைவில்...', 'దాత ఫీచర్లు త్వరలో...')}
          </p>
        </div>
      </main>
    </div>
  )
}
