import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { INDIAN_STATES } from '../constants/states'
import { ONBOARDING_STEPS } from '../constants/onboardingOptions'
import type { Language } from '../context/LanguageContext'

export default function StudentOnboarding() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { language, t } = useLanguage()
  const { user, updateProfile } = useAuth()
  const isEditMode = searchParams.get('edit') === 'true'

  const existingData = user?.user_metadata || {}

  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({
    state: existingData.state || '',
    category: existingData.category || '',
    educationLevel: existingData.educationLevel || '',
    income: existingData.income || '',
    gender: existingData.gender || '',
    disability: existingData.disability != null ? String(existingData.disability) : '',
    religion: existingData.religion || '',
    area: existingData.area || '',
    course: existingData.course || ''
  })
  const [stateFilter, setStateFilter] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const totalSteps = ONBOARDING_STEPS.length
  const step = ONBOARDING_STEPS[currentStep]

  const getLabel = (label: { en: string; hi: string; ta: string; te: string }) => {
    return label[language as Language] || label.en
  }

  const filteredStates = useMemo(() => {
    if (!stateFilter) return INDIAN_STATES
    const lower = stateFilter.toLowerCase()
    return INDIAN_STATES.filter(s =>
      s.en.toLowerCase().includes(lower) || s.hi.includes(stateFilter)
    )
  }, [stateFilter])

  const handleSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, [step.id]: value }))
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setSaving(true)
    setError('')
    try {
      const profileData: Record<string, unknown> = {
        state: answers.state,
        category: answers.category,
        educationLevel: answers.educationLevel,
        income: answers.income,
        gender: answers.gender,
        disability: answers.disability === 'true',
        religion: answers.religion,
        area: answers.area,
        course: answers.course,
        profileComplete: true
      }
      const { error: updateError } = await updateProfile(profileData)
      if (updateError) {
        setError(updateError)
        setSaving(false)
        return
      }
      navigate('/student')
    } catch {
      setError(t('Something went wrong. Please try again.', 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।', 'ஏதோ தவறு ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.', 'ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.'))
      setSaving(false)
    }
  }

  const isLastStep = currentStep === totalSteps - 1
  const currentAnswer = answers[step.id]

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-amber-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {isEditMode
              ? t('Edit Your Profile', 'अपनी प्रोफ़ाइल संपादित करें', 'உங்கள் சுயவிவரத்தைத் திருத்தவும்', 'మీ ప్రొఫైల్ సవరించండి')
              : t('Complete Your Profile', 'अपनी प्रोफ़ाइल पूरी करें', 'உங்கள் சுயவிவரத்தை நிறைவு செய்யுங்கள்', 'మీ ప్రొఫైల్ పూర్తి చేయండి')}
          </h1>
          <p className="text-gray-500 text-xs mt-1">
            {t('Help us find the best scholarships for you', 'आपके लिए सर्वोत्तम छात्रवृत्ति खोजने में हमारी मदद करें', 'உங்களுக்கான சிறந்த உதவித்தொகைகளைக் கண்டறிய எங்களுக்கு உதவுங்கள்', 'మీ కోసం ఉత్తమ స్కాలర్‌షిప్‌లను కనుగొనడంలో మాకు సహాయం చేయండి')}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{t(`Step ${currentStep + 1} of ${totalSteps}`, `चरण ${currentStep + 1} / ${totalSteps}`, `படி ${currentStep + 1} / ${totalSteps}`, `దశ ${currentStep + 1} / ${totalSteps}`)}</span>
            <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-teal-700 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          {getLabel(step.question)}
        </h2>

        {/* State step - searchable list */}
        {step.id === 'state' ? (
          <div>
            <input
              type="text"
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
              placeholder={t('Search state...', 'राज्य खोजें...', 'மாநிலத்தை தேடுங்கள்...', 'రాష్ట్రాన్ని శోధించండి...')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none mb-3"
            />
            <div className="max-h-56 overflow-y-auto space-y-1.5">
              {filteredStates.map(state => (
                <button
                  key={state.en}
                  onClick={() => handleSelect(state.en)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    answers.state === state.en
                      ? 'bg-teal-100 border-teal-500 text-teal-800 border'
                      : 'border border-gray-200 text-gray-700 hover:border-teal-400 hover:bg-teal-50'
                  }`}
                >
                  {language === 'hi' ? state.hi : state.en}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Other steps - option buttons */
          <div className="grid grid-cols-2 gap-2">
            {step.options.map(option => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                  currentAnswer === option.value
                    ? 'bg-teal-100 border-teal-500 text-teal-800 border'
                    : 'border border-gray-200 text-gray-700 hover:border-teal-400 hover:bg-teal-50'
                }`}
              >
                {getLabel(option.label)}
              </button>
            ))}
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {t('Back', 'पीछे', 'பின்', 'వెనుకకు')}
          </button>

          {isLastStep && currentAnswer ? (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2.5 bg-teal-700 text-white text-sm font-medium rounded-xl hover:bg-teal-800 transition-colors disabled:opacity-50"
            >
              {saving
                ? t('Saving...', 'सहेजा जा रहा है...', 'சேமிக்கிறது...', 'సేవ్ చేస్తోంది...')
                : isEditMode
                  ? t('Save Changes', 'परिवर्तन सहेजें', 'மாற்றங்களைச் சேமி', 'మార్పులు సేవ్ చేయండి')
                  : t('Complete Profile', 'प्रोफ़ाइल पूरा करें', 'சுயவிவரத்தை நிறைவு செய்', 'ప్రొఫైల్ పూర్తి చేయండి')}
            </button>
          ) : (
            <span className="text-xs text-gray-400">
              {currentAnswer
                ? t('Select to continue', 'जारी रखने के लिए चुनें', 'தொடர தேர்ந்தெடுக்கவும்', 'కొనసాగించడానికి ఎంచుకోండి')
                : t('Choose an option', 'एक विकल्प चुनें', 'ஒரு விருப்பத்தைத் தேர்ந்தெடுக்கவும்', 'ఒక ఎంపికను ఎంచుకోండి')}
            </span>
          )}
        </div>

        {/* Skip option for non-edit mode */}
        {!isEditMode && (
          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/student')}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              {t('Skip for now', 'अभी छोड़ दें', 'இப்போது தவிர்க்கவும்', 'ప్రస్తుతం దాటవేయండి')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
