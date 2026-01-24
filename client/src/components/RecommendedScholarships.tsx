import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRecommendations } from '../services/apiClient'
import type { RecommendedScholarship } from '../services/apiClient'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import ScholarshipCard from './ScholarshipCard'

export default function RecommendedScholarships() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user, profileComplete } = useAuth()
  const [recommendations, setRecommendations] = useState<RecommendedScholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!profileComplete || !user?.user_metadata) {
      setLoading(false)
      return
    }

    const fetchRecommendations = async () => {
      try {
        const meta = user.user_metadata
        const res = await getRecommendations({
          state: meta.state,
          category: meta.category,
          educationLevel: meta.educationLevel,
          income: meta.income,
          gender: meta.gender,
          disability: meta.disability,
          course: meta.course
        })
        setRecommendations(res.recommendations)
      } catch {
        setError(t(
          'Failed to load recommendations. Please try again.',
          'सिफारिशें लोड करने में विफल। कृपया पुनः प्रयास करें।',
          'பரிந்துரைகளை ஏற்ற இயலவில்லை. மீண்டும் முயற்சிக்கவும்.',
          'సిఫార్సులు లోడ్ చేయడంలో విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.'
        ))
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [profileComplete, user])

  // Profile not complete
  if (!profileComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {t('Complete Your Profile', 'अपनी प्रोफ़ाइल पूरी करें', 'உங்கள் சுயவிவரத்தை நிறைவு செய்யுங்கள்', 'మీ ప్రొఫైల్ పూర్తి చేయండి')}
        </h3>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">
          {t(
            'Complete your profile to get personalized scholarship recommendations.',
            'व्यक्तिगत छात्रवृत्ति सिफारिशें पाने के लिए अपनी प्रोफ़ाइल पूरी करें।',
            'தனிப்பயன் உதவித்தொகை பரிந்துரைகளைப் பெற உங்கள் சுயவிவரத்தை நிறைவு செய்யுங்கள்.',
            'వ్యక్తిగతీకరించిన స్కాలర్‌షిప్ సిఫార్సులు పొందడానికి మీ ప్రొఫైల్ పూర్తి చేయండి.'
          )}
        </p>
        <button
          onClick={() => navigate('/student/onboarding')}
          className="px-6 py-2.5 bg-teal-700 text-white text-sm font-medium rounded-xl hover:bg-teal-800 transition-colors"
        >
          {t('Complete Profile', 'प्रोफ़ाइल पूरा करें', 'சுயவிவரத்தை நிறைவு செய்', 'ప్రొఫైల్ పూర్తి చేయండి')}
        </button>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-gray-500">
          {t('Finding scholarships for you...', 'आपके लिए छात्रवृत्ति खोज रहे हैं...', 'உங்களுக்கான உதவித்தொகைகளைத் தேடுகிறோம்...', 'మీ కోసం స్కాలర్‌షిప్‌లను కనుగొంటున్నాము...')}
        </p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <p className="text-sm text-red-600 mb-3">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm text-teal-700 hover:text-teal-900"
        >
          {t('Try Again', 'पुनः प्रयास करें', 'மீண்டும் முயற்சிக்கவும்', 'మళ్ళీ ప్రయత్నించండి')}
        </button>
      </div>
    )
  }

  const meta = user?.user_metadata || {}

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {/* Profile summary */}
        <div className="flex items-center justify-between mb-4 p-3 bg-teal-50 rounded-xl border border-teal-100">
          <div className="flex flex-wrap gap-2 text-xs text-teal-800">
            {meta.state && <span className="px-2 py-0.5 bg-white rounded-full border border-teal-200">{meta.state}</span>}
            {meta.category && <span className="px-2 py-0.5 bg-white rounded-full border border-teal-200">{meta.category}</span>}
            {meta.educationLevel && <span className="px-2 py-0.5 bg-white rounded-full border border-teal-200">{meta.educationLevel}</span>}
            {meta.course && <span className="px-2 py-0.5 bg-white rounded-full border border-teal-200">{meta.course}</span>}
          </div>
          <button
            onClick={() => navigate('/student/onboarding?edit=true')}
            className="shrink-0 text-xs text-teal-700 hover:text-teal-900 font-medium ml-2"
          >
            {t('Edit', 'संपादित', 'திருத்து', 'సవరించు')}
          </button>
        </div>

        {/* Results header */}
        <h3 className="text-base font-semibold text-gray-800 mb-3">
          {t(
            `${recommendations.length} scholarship${recommendations.length !== 1 ? 's' : ''} recommended for you`,
            `आपके लिए ${recommendations.length} छात्रवृत्ति अनुशंसित`,
            `உங்களுக்கு ${recommendations.length} உதவித்தொகை${recommendations.length !== 1 ? 'கள்' : ''} பரிந்துரைக்கப்படுகிறது`,
            `మీ కోసం ${recommendations.length} స్కాలర్‌షిప్${recommendations.length !== 1 ? 'లు' : ''} సిఫార్సు చేయబడింది`
          )}
        </h3>

        {/* Scholarship list */}
        {recommendations.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm">
              {t(
                'No matching scholarships found for your profile. Try updating your profile or use Chat for a broader search.',
                'आपकी प्रोफ़ाइल के लिए कोई छात्रवृत्ति नहीं मिली। अपनी प्रोफ़ाइल अपडेट करें या व्यापक खोज के लिए चैट का उपयोग करें।',
                'உங்கள் சுயவிவரத்துக்கு பொருத்தமான உதவித்தொகை கிடைக்கவில்லை. சுயவிவரத்தை புதுப்பிக்கவும் அல்லது சாட் பயன்படுத்தவும்.',
                'మీ ప్రొఫైల్‌కు సరిపోలిన స్కాలర్‌షిప్‌లు కనుగొనబడలేదు. ప్రొఫైల్ అప్‌డేట్ చేయండి లేదా చాట్ వాడండి.'
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map(s => (
              <ScholarshipCard
                key={s.id}
                scholarship={s}
                t={t}
                matchScore={s.matchScore}
                matchReasons={s.matchReasons}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
