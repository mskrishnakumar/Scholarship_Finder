import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { INDIAN_STATES } from '../constants/states'
import {
  CATEGORY_OPTIONS,
  EDUCATION_OPTIONS,
  INCOME_OPTIONS,
  GENDER_OPTIONS,
  DISABILITY_OPTIONS,
  RELIGION_OPTIONS,
  AREA_OPTIONS,
  COURSE_OPTIONS
} from '../constants/onboardingOptions'
import type { Language } from '../context/LanguageContext'
import { Button } from './common/Button'

interface ProfileSlidePanelProps {
  isOpen: boolean
  onClose: () => void
  onSaveSuccess: () => void
}

export default function ProfileSlidePanel({ isOpen, onClose, onSaveSuccess }: ProfileSlidePanelProps) {
  const { language, t } = useLanguage()
  const { user, updateProfile } = useAuth()

  const existingData = user?.user_metadata || {}

  const [formData, setFormData] = useState({
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

  // Reset form when panel opens
  useEffect(() => {
    if (isOpen) {
      const data = user?.user_metadata || {}
      setFormData({
        state: data.state || '',
        category: data.category || '',
        educationLevel: data.educationLevel || '',
        income: data.income || '',
        gender: data.gender || '',
        disability: data.disability != null ? String(data.disability) : '',
        religion: data.religion || '',
        area: data.area || '',
        course: data.course || ''
      })
      setStateFilter('')
      setError('')
    }
  }, [isOpen, user])

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const filteredStates = useMemo(() => {
    if (!stateFilter) return INDIAN_STATES
    const lower = stateFilter.toLowerCase()
    return INDIAN_STATES.filter(s =>
      s.en.toLowerCase().includes(lower) || s.hi.includes(stateFilter)
    )
  }, [stateFilter])

  const getLabel = (label: { en: string; hi: string; ta: string; te: string }) => {
    return label[language as Language] || label.en
  }

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const profileData: Record<string, unknown> = {
        state: formData.state,
        category: formData.category,
        educationLevel: formData.educationLevel,
        income: formData.income,
        gender: formData.gender,
        disability: formData.disability === 'true',
        religion: formData.religion,
        area: formData.area,
        course: formData.course,
        profileComplete: true
      }
      const { error: updateError } = await updateProfile(profileData)
      if (updateError) {
        setError(updateError)
        setSaving(false)
        return
      }
      onSaveSuccess()
      onClose()
    } catch {
      setError(t('Something went wrong. Please try again.', 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।', 'ஏதோ தவறு ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.', 'ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.'))
      setSaving(false)
    }
  }

  const renderSelectField = (
    fieldId: string,
    label: string,
    options: { value: string; label: { en: string; hi: string; ta: string; te: string } }[],
    value: string
  ) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleFieldChange(fieldId, option.value)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              value === option.value
                ? 'bg-teal-100 border-teal-500 text-teal-800 border'
                : 'border border-gray-200 text-gray-700 hover:border-teal-400 hover:bg-teal-50'
            }`}
          >
            {getLabel(option.label)}
          </button>
        ))}
      </div>
    </div>
  )

  if (!isOpen) return null

  const panelContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel - full screen on mobile, slide from right on desktop */}
      <div className={`
        fixed z-50 bg-white shadow-xl overflow-hidden
        inset-0 lg:inset-y-0 lg:left-auto lg:right-0 lg:w-[420px]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-teal-600 to-teal-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {t('Edit Profile', 'प्रोफ़ाइल संपादित करें', 'சுயவிவரத்தைத் திருத்து', 'ప్రొఫైల్ సవరించు')}
              </h2>
              <p className="text-teal-100 text-xs">
                {t('Update to refresh recommendations', 'सिफारिशें रिफ्रेश करने के लिए अपडेट करें', 'பரிந்துரைகளை புதுப்பிக்க மாற்றவும்', 'సిఫారసులను రిఫ్రెష్ చేయడానికి అప్‌డేట్ చేయండి')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <div className="overflow-y-auto h-[calc(100%-140px)] p-4 space-y-5">
          {/* State Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('State', 'राज्य', 'மாநிலம்', 'రాష్ట్రం')}
            </label>
            <input
              type="text"
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
              placeholder={t('Search state...', 'राज्य खोजें...', 'மாநிலத்தை தேடுங்கள்...', 'రాష్ట్రాన్ని శోధించండి...')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
            />
            <div className="max-h-32 overflow-y-auto space-y-1 border border-gray-200 rounded-lg p-2">
              {filteredStates.slice(0, 10).map(state => (
                <button
                  key={state.en}
                  type="button"
                  onClick={() => {
                    handleFieldChange('state', state.en)
                    setStateFilter('')
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    formData.state === state.en
                      ? 'bg-teal-100 border-teal-500 text-teal-800 border'
                      : 'text-gray-700 hover:bg-teal-50'
                  }`}
                >
                  {language === 'hi' ? state.hi : state.en}
                </button>
              ))}
              {filteredStates.length === 0 && (
                <p className="text-sm text-gray-400 px-3 py-2">{t('No states found', 'कोई राज्य नहीं मिला', 'மாநிலங்கள் இல்லை', 'రాష్ట్రాలు కనుగొనబడలేదు')}</p>
              )}
            </div>
            {formData.state && (
              <p className="text-xs text-teal-600">
                {t('Selected:', 'चयनित:', 'தேர்ந்தெடுக்கப்பட்டது:', 'ఎంచుకున్నది:')} {formData.state}
              </p>
            )}
          </div>

          {/* Category */}
          {renderSelectField(
            'category',
            t('Caste Category', 'जाति श्रेणी', 'சாதி வகை', 'కులం వర్గం'),
            CATEGORY_OPTIONS,
            formData.category
          )}

          {/* Education Level */}
          {renderSelectField(
            'educationLevel',
            t('Education Level', 'शिक्षा स्तर', 'கல்வி நிலை', 'విద్యా స్థాయి'),
            EDUCATION_OPTIONS,
            formData.educationLevel
          )}

          {/* Course */}
          {renderSelectField(
            'course',
            t('Course / Field', 'पाठ्यक्रम / क्षेत्र', 'படிப்பு / துறை', 'కోర్సు / రంగం'),
            COURSE_OPTIONS,
            formData.course
          )}

          {/* Income */}
          {renderSelectField(
            'income',
            t('Annual Family Income', 'वार्षिक पारिवारिक आय', 'ஆண்டு குடும்ப வருமானம்', 'వార్షిక కుటుంబ ఆదాయం'),
            INCOME_OPTIONS,
            formData.income
          )}

          {/* Gender */}
          {renderSelectField(
            'gender',
            t('Gender', 'लिंग', 'பாலினம்', 'లింగం'),
            GENDER_OPTIONS,
            formData.gender
          )}

          {/* Disability */}
          {renderSelectField(
            'disability',
            t('Disability (40%+)', 'विकलांगता (40%+)', 'குறைபாடு (40%+)', 'వైకల్యం (40%+)'),
            DISABILITY_OPTIONS,
            formData.disability
          )}

          {/* Religion */}
          {renderSelectField(
            'religion',
            t('Religion', 'धर्म', 'மதம்', 'మతం'),
            RELIGION_OPTIONS,
            formData.religion
          )}

          {/* Area */}
          {renderSelectField(
            'area',
            t('Area Type', 'क्षेत्र प्रकार', 'பகுதி வகை', 'ప్రాంత రకం'),
            AREA_OPTIONS,
            formData.area
          )}
        </div>

        {/* Footer with Save Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          {error && (
            <p className="text-sm text-red-600 mb-3">{error}</p>
          )}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              {t('Cancel', 'रद्द करें', 'ரத்து', 'రద్దు చేయండి')}
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              isLoading={saving}
              className="flex-1"
            >
              {saving
                ? t('Saving...', 'सहेजा जा रहा है...', 'சேமிக்கிறது...', 'సేవ్ చేస్తోంది...')
                : t('Save & Refresh', 'सहेजें और रिफ्रेश करें', 'சேமி & புதுப்பி', 'సేవ్ & రిఫ్రెష్')
              }
            </Button>
          </div>
        </div>
      </div>
    </>
  )

  return createPortal(panelContent, document.body)
}
