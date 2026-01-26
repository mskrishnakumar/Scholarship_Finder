import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { INDIAN_STATES } from '../../constants/states'
import {
  BuildingOfficeIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  PhoneIcon,
  PencilIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

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

interface OrganizationData {
  organizationName: string
  organizationType: string
  designation: string
  organizationWebsite: string
  contactEmail: string
  contactPhone: string
  focusAreas: string[]
  geographicPreference: string[]
}

export default function DonorOrganization() {
  const { t } = useLanguage()
  const { user, updateProfile, donorProfileComplete } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [formData, setFormData] = useState<OrganizationData>({
    organizationName: '',
    organizationType: '',
    designation: '',
    organizationWebsite: '',
    contactEmail: '',
    contactPhone: '',
    focusAreas: [],
    geographicPreference: [],
  })

  // Load organization data from user metadata
  useEffect(() => {
    if (user?.user_metadata) {
      const meta = user.user_metadata
      setFormData({
        organizationName: meta.organizationName || '',
        organizationType: meta.organizationType || '',
        designation: meta.designation || '',
        organizationWebsite: meta.organizationWebsite || '',
        contactEmail: meta.contactEmail || '',
        contactPhone: meta.contactPhone || '',
        focusAreas: meta.focusAreas || [],
        geographicPreference: meta.geographicPreference || [],
      })
    }
  }, [user])

  // Auto-open edit mode if profile is incomplete
  useEffect(() => {
    if (!donorProfileComplete && user) {
      setIsEditing(true)
    }
  }, [donorProfileComplete, user])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const toggleFocusArea = (val: string) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(val)
        ? prev.focusAreas.filter(v => v !== val)
        : [...prev.focusAreas, val]
    }))
  }

  const toggleGeoPref = (val: string) => {
    setFormData(prev => ({
      ...prev,
      geographicPreference: prev.geographicPreference.includes(val)
        ? prev.geographicPreference.filter(v => v !== val)
        : [...prev.geographicPreference, val]
    }))
  }

  const isProfileComplete = () => {
    return !!(
      formData.organizationName.trim() &&
      formData.organizationType
    )
  }

  const handleSave = async () => {
    setLoading(true)
    setSaveSuccess(false)
    try {
      const result = await updateProfile({
        ...formData,
        donorProfileComplete: isProfileComplete(),
      })
      if (!result.error) {
        setIsEditing(false)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch {
      // Handle error silently
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset to saved data
    if (user?.user_metadata) {
      const meta = user.user_metadata
      setFormData({
        organizationName: meta.organizationName || '',
        organizationType: meta.organizationType || '',
        designation: meta.designation || '',
        organizationWebsite: meta.organizationWebsite || '',
        contactEmail: meta.contactEmail || '',
        contactPhone: meta.contactPhone || '',
        focusAreas: meta.focusAreas || [],
        geographicPreference: meta.geographicPreference || [],
      })
    }
    setIsEditing(false)
  }

  const getOrgTypeLabel = (value: string) => {
    const orgType = ORG_TYPES.find(o => o.value === value)
    return orgType ? t(orgType.labelKey[0], orgType.labelKey[1], orgType.labelKey[2], orgType.labelKey[3]) : value
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t(
              'Organization Profile',
              'संगठन प्रोफ़ाइल',
              'நிறுவன சுயவிவரம்',
              'సంస్థ ప్రొఫైల్'
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t(
              'Manage your organization information',
              'अपनी संगठन जानकारी प्रबंधित करें',
              'உங்கள் நிறுவன தகவலை நிர்வகிக்கவும்',
              'మీ సంస్థ సమాచారాన్ని నిర్వహించండి'
            )}
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="secondary">
            <PencilIcon className="w-4 h-4 mr-2" />
            {t('Edit', 'संपादित करें', 'திருத்து', 'సవరించు')}
          </Button>
        )}
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5" />
          {t(
            'Profile saved successfully!',
            'प्रोफ़ाइल सफलतापूर्वक सहेजी गई!',
            'சுயவிவரம் வெற்றிகரமாக சேமிக்கப்பட்டது!',
            'ప్రొఫైల్ విజయవంతంగా సేవ్ చేయబడింది!'
          )}
        </div>
      )}

      {/* Incomplete Profile Warning */}
      {!donorProfileComplete && !isEditing && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          {t(
            'Please complete your organization profile to start adding scholarships.',
            'छात्रवृत्ति जोड़ना शुरू करने के लिए कृपया अपनी संगठन प्रोफ़ाइल पूरी करें।',
            'உதவித்தொகைகளைச் சேர்க்கத் தொடங்க உங்கள் நிறுவன சுயவிவரத்தை பூர்த்தி செய்யவும்.',
            'స్కాలర్‌షిప్‌లను జోడించడం ప్రారంభించడానికి దయచేసి మీ సంస్థ ప్రొఫైల్‌ను పూర్తి చేయండి.'
          )}
        </div>
      )}

      {/* Organization Card */}
      <Card padding="lg">
        {isEditing ? (
          /* Edit Mode */
          <div className="space-y-6">
            {/* Basic Info Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                {t('Basic Information', 'बुनियादी जानकारी', 'அடிப்படை தகவல்', 'ప్రాథమిక సమాచారం')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Organization Name', 'संगठन का नाम', 'நிறுவன பெயர்', 'సంస్థ పేరు')} *
                  </label>
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    placeholder={t('Enter organization name', 'संगठन का नाम दर्ज करें', 'நிறுவன பெயரை உள்ளிடவும்', 'సంస్థ పేరు నమోదు చేయండి')}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Organization Type', 'संगठन का प्रकार', 'நிறுவன வகை', 'సంస్థ రకం')} *
                  </label>
                  <select
                    name="organizationType"
                    value={formData.organizationType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white"
                    disabled={loading}
                  >
                    <option value="">{t('Select type...', 'प्रकार चुनें...', 'வகையைத் தேர்ந்தெடுக்கவும்...', 'రకాన్ని ఎంచుకోండి...')}</option>
                    {ORG_TYPES.map(o => (
                      <option key={o.value} value={o.value}>
                        {t(o.labelKey[0], o.labelKey[1], o.labelKey[2], o.labelKey[3])}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Info Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                {t('Contact Information', 'संपर्क जानकारी', 'தொடர்பு தகவல்', 'సంప్రదింపు సమాచారం')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Your Designation', 'आपका पदनाम', 'உங்கள் பதவி', 'మీ హోదా')}
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    placeholder={t('e.g. CSR Manager, Trustee', 'जैसे सीएसआर मैनेजर, ट्रस्टी', 'எ.கா. CSR மேலாளர், அறங்காவலர்', 'ఉదా. CSR మేనేజర్, ట్రస్టీ')}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Website', 'वेबसाइट', 'இணையதளம்', 'వెబ్‌సైట్')}
                  </label>
                  <input
                    type="url"
                    name="organizationWebsite"
                    value={formData.organizationWebsite}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    placeholder="https://example.com"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Contact Email', 'संपर्क ईमेल', 'தொடர்பு மின்னஞ்சல்', 'సంప్రదింపు ఇమెయిల్')}
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    placeholder="contact@organization.com"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Contact Phone', 'संपर्क फ़ोन', 'தொடர்பு தொலைபேசி', 'సంప్రదింపు ఫోన్')}
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    placeholder="+91 98765 43210"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Scholarship Preferences Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                {t('Scholarship Preferences', 'छात्रवृत्ति प्राथमिकताएं', 'உதவித்தொகை விருப்பத்தேர்வுகள்', 'స్కాలర్‌షిప్ ప్రాధాన్యతలు')}
              </h3>

              {/* Focus Areas */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Focus Areas', 'फोकस क्षेत्र', 'கவன பகுதிகள்', 'ఫోకస్ ఏరియాలు')}
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  {t(
                    'Select the student categories you want to support',
                    'उन छात्र श्रेणियों का चयन करें जिनका आप समर्थन करना चाहते हैं',
                    'நீங்கள் ஆதரிக்க விரும்பும் மாணவர் வகைகளைத் தேர்ந்தெடுக்கவும்',
                    'మీరు మద్దతు ఇవ్వాలనుకునే విద్యార్థి వర్గాలను ఎంచుకోండి'
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {FOCUS_AREAS.map(fa => (
                    <button
                      key={fa.value}
                      type="button"
                      onClick={() => toggleFocusArea(fa.value)}
                      disabled={loading}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                        formData.focusAreas.includes(fa.value)
                          ? 'bg-amber-100 border-amber-300 text-amber-800'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                <p className="text-xs text-gray-500 mb-2">
                  {t(
                    'Select the states where you want to offer scholarships',
                    'उन राज्यों का चयन करें जहां आप छात्रवृत्ति देना चाहते हैं',
                    'நீங்கள் உதவித்தொகை வழங்க விரும்பும் மாநிலங்களைத் தேர்ந்தெடுக்கவும்',
                    'మీరు స్కాలర్‌షిప్‌లు అందించాలనుకునే రాష్ట్రాలను ఎంచుకోండి'
                  )}
                </p>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                  {INDIAN_STATES.map(state => (
                    <label key={state.en} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.geographicPreference.includes(state.en)}
                        onChange={() => toggleGeoPref(state.en)}
                        disabled={loading}
                        className="w-3.5 h-3.5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                      />
                      <span className="text-xs text-gray-700">{state.en}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={handleCancel} disabled={loading}>
                {t('Cancel', 'रद्द करें', 'ரத்து செய்', 'రద్దు చేయి')}
              </Button>
              <Button onClick={handleSave} isLoading={loading}>
                {t('Save Profile', 'प्रोफ़ाइल सहेजें', 'சுயவிவரத்தை சேமி', 'ప్రొఫైల్ సేవ్ చేయి')}
              </Button>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="space-y-6">
            {/* Organization Header */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <BuildingOfficeIcon className="w-8 h-8 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900">
                  {formData.organizationName || t('Organization Name', 'संगठन का नाम', 'நிறுவன பெயர்', 'సంస్థ పేరు')}
                </h2>
                {formData.organizationType && (
                  <span className="inline-flex items-center px-2.5 py-0.5 mt-2 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    {getOrgTypeLabel(formData.organizationType)}
                  </span>
                )}
                {formData.designation && (
                  <p className="text-sm text-gray-600 mt-2">
                    {formData.designation}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                {t('Contact Information', 'संपर्क जानकारी', 'தொடர்பு தகவல்', 'సంప్రదింపు సమాచారం')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GlobeAltIcon className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">{t('Website', 'वेबसाइट', 'இணையதளம்', 'వెబ్‌సైట్')}</p>
                    {formData.organizationWebsite ? (
                      <a href={formData.organizationWebsite} target="_blank" rel="noopener noreferrer" className="text-sm text-amber-600 hover:text-amber-700 truncate block">
                        {formData.organizationWebsite}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-400 italic">{t('Not provided', 'प्रदान नहीं किया गया', 'வழங்கப்படவில்லை', 'అందించబడలేదు')}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <EnvelopeIcon className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">{t('Email', 'ईमेल', 'மின்னஞ்சல்', 'ఇమెయిల్')}</p>
                    {formData.contactEmail ? (
                      <a href={`mailto:${formData.contactEmail}`} className="text-sm text-amber-600 hover:text-amber-700 truncate block">
                        {formData.contactEmail}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-400 italic">{t('Not provided', 'प्रदान नहीं किया गया', 'வழங்கப்படவில்லை', 'అందించబడలేదు')}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PhoneIcon className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">{t('Phone', 'फ़ोन', 'தொலைபேசி', 'ఫోన్')}</p>
                    {formData.contactPhone ? (
                      <a href={`tel:${formData.contactPhone}`} className="text-sm text-amber-600 hover:text-amber-700">
                        {formData.contactPhone}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-400 italic">{t('Not provided', 'प्रदान नहीं किया गया', 'வழங்கப்படவில்லை', 'అందించబడలేదు')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Scholarship Preferences */}
            {(formData.focusAreas.length > 0 || formData.geographicPreference.length > 0) && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  {t('Scholarship Preferences', 'छात्रवृत्ति प्राथमिकताएं', 'உதவித்தொகை விருப்பத்தேர்வுகள்', 'స్కాలర్‌షిప్ ప్రాధాన్యతలు')}
                </h3>

                {formData.focusAreas.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">{t('Focus Areas', 'फोकस क्षेत्र', 'கவன பகுதிகள்', 'ఫోకస్ ఏరియాలు')}</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.focusAreas.map(area => {
                        const fa = FOCUS_AREAS.find(f => f.value === area)
                        return (
                          <span key={area} className="px-2.5 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
                            {fa ? t(fa.labelKey[0], fa.labelKey[1], fa.labelKey[2], fa.labelKey[3]) : area}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                {formData.geographicPreference.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">{t('Geographic Preference', 'भौगोलिक प्राथमिकता', 'புவியியல் விருப்பம்', 'భౌగోళిక ప్రాధాన్యత')}</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.geographicPreference.map(state => (
                        <span key={state} className="px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                          {state}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
