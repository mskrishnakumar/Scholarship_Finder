import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function StudentOnboarding() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-amber-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('Complete Your Profile', 'अपनी प्रोफ़ाइल पूरी करें', 'உங்கள் சுயவிவரத்தை நிறைவு செய்யுங்கள்', 'మీ ప్రొఫైల్ పూర్తి చేయండి')}
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          {t('Onboarding flow coming soon...', 'ऑनबोर्डिंग जल्द आ रहा है...', 'விரைவில் வரும்...', 'త్వరలో వస్తోంది...')}
        </p>
        <button
          onClick={() => navigate('/student')}
          className="px-6 py-2.5 bg-teal-700 text-white text-sm font-medium rounded-xl hover:bg-teal-800 transition-colors"
        >
          {t('Go to Dashboard', 'डैशबोर्ड पर जाएं', 'டாஷ்போர்டுக்குச் செல்', 'డ్యాష్‌బోర్డ్‌కు వెళ్ళండి')}
        </button>
      </div>
    </div>
  )
}
