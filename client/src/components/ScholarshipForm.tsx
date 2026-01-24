import { useState, useMemo } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { INDIAN_STATES } from '../constants/states'
import {
  CATEGORY_OPTIONS, EDUCATION_OPTIONS, INCOME_OPTIONS,
  GENDER_OPTIONS, RELIGION_OPTIONS, AREA_OPTIONS, COURSE_OPTIONS
} from '../constants/onboardingOptions'
import type { OnboardingOption } from '../constants/onboardingOptions'
import type { ScholarshipFull, CreateScholarshipRequest } from '../services/apiClient'

interface ScholarshipFormProps {
  initialData?: ScholarshipFull | null
  onSubmit: (data: CreateScholarshipRequest) => Promise<void>
  onCancel: () => void
  loading: boolean
}

interface FormState {
  name: string
  description: string
  benefits: string
  deadline: string
  officialUrl: string
  applicationSteps: string[]
  requiredDocuments: string[]
  eligibility: {
    states: string[]
    categories: string[]
    maxIncome: string
    educationLevels: string[]
    gender: string
    disability: string
    religion: string[]
    area: string
    courses: string[]
  }
}

function initFormState(data?: ScholarshipFull | null): FormState {
  if (!data) {
    return {
      name: '',
      description: '',
      benefits: '',
      deadline: '',
      officialUrl: '',
      applicationSteps: [],
      requiredDocuments: [],
      eligibility: {
        states: ['all'],
        categories: ['all'],
        maxIncome: '',
        educationLevels: ['all'],
        gender: 'all',
        disability: 'false',
        religion: ['all'],
        area: 'all',
        courses: ['all'],
      }
    }
  }
  const elig = data.eligibility
  return {
    name: data.name,
    description: data.description,
    benefits: data.benefits || '',
    deadline: data.deadline || '',
    officialUrl: data.officialUrl || '',
    applicationSteps: data.applicationSteps?.length ? [...data.applicationSteps] : [],
    requiredDocuments: data.requiredDocuments?.length ? [...data.requiredDocuments] : [],
    eligibility: {
      states: elig.states?.length ? [...elig.states] : ['all'],
      categories: elig.categories?.length ? [...elig.categories] : ['all'],
      maxIncome: elig.maxIncome != null ? String(elig.maxIncome) : '',
      educationLevels: elig.educationLevels?.length ? [...elig.educationLevels] : ['all'],
      gender: elig.gender || 'all',
      disability: elig.disability ? 'true' : 'false',
      religion: Array.isArray(elig.religion)
        ? [...elig.religion]
        : elig.religion ? [elig.religion] : ['all'],
      area: elig.area || 'all',
      courses: elig.courses?.length ? [...elig.courses] : ['all'],
    }
  }
}

export default function ScholarshipForm({ initialData, onSubmit, onCancel, loading }: ScholarshipFormProps) {
  const { t } = useLanguage()
  const [form, setForm] = useState<FormState>(() => initFormState(initialData))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [stateSearch, setStateSearch] = useState('')

  const isEdit = !!initialData

  const filteredStates = useMemo(() => {
    if (!stateSearch) return INDIAN_STATES
    const q = stateSearch.toLowerCase()
    return INDIAN_STATES.filter(s => s.en.toLowerCase().includes(q) || s.hi.includes(stateSearch))
  }, [stateSearch])

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = t('Name is required', 'नाम आवश्यक है', 'பெயர் தேவை', 'పేరు అవసరం')
    if (!form.description.trim()) errs.description = t('Description is required', 'विवरण आवश्यक है', 'விளக்கம் தேவை', 'వివరణ అవసరం')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const elig = form.eligibility
    const data: CreateScholarshipRequest = {
      name: form.name.trim(),
      description: form.description.trim(),
      benefits: form.benefits.trim() || undefined,
      deadline: form.deadline || undefined,
      officialUrl: form.officialUrl.trim() || undefined,
      applicationSteps: form.applicationSteps.filter(s => s.trim()),
      requiredDocuments: form.requiredDocuments.filter(d => d.trim()),
      eligibility: {
        states: elig.states,
        categories: elig.categories,
        maxIncome: elig.maxIncome ? Number(elig.maxIncome) : null,
        educationLevels: elig.educationLevels,
        gender: elig.gender,
        disability: elig.disability === 'true',
        religion: elig.religion,
        area: elig.area,
        courses: elig.courses,
      }
    }
    await onSubmit(data)
  }

  // Checkbox group toggle helper
  const toggleCheckbox = (field: 'states' | 'categories' | 'educationLevels' | 'religion' | 'courses', value: string) => {
    setForm(prev => {
      const current = prev.eligibility[field] as string[]
      if (value === 'all') {
        return { ...prev, eligibility: { ...prev.eligibility, [field]: ['all'] } }
      }
      const withoutAll = current.filter(v => v !== 'all')
      const newVal = withoutAll.includes(value)
        ? withoutAll.filter(v => v !== value)
        : [...withoutAll, value]
      return { ...prev, eligibility: { ...prev.eligibility, [field]: newVal.length ? newVal : ['all'] } }
    })
  }

  const isAllSelected = (field: 'states' | 'categories' | 'educationLevels' | 'religion' | 'courses') => {
    return form.eligibility[field].includes('all')
  }

  // Dynamic list helpers
  const addListItem = (field: 'applicationSteps' | 'requiredDocuments') => {
    setForm(prev => ({ ...prev, [field]: [...prev[field], ''] }))
  }

  const removeListItem = (field: 'applicationSteps' | 'requiredDocuments', index: number) => {
    setForm(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }))
  }

  const updateListItem = (field: 'applicationSteps' | 'requiredDocuments', index: number, value: string) => {
    setForm(prev => ({ ...prev, [field]: prev[field].map((item, i) => i === index ? value : item) }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          {t('Basic Information', 'मूल जानकारी', 'அடிப்படை தகவல்', 'ప్రాథమిక సమాచారం')}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Scholarship Name', 'छात्रवृत्ति का नाम', 'உதவித்தொகை பெயர்', 'స్కాలర్‌షిప్ పేరు')} *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              placeholder={t('Enter scholarship name', 'छात्रवृत्ति का नाम दर्ज करें', 'உதவித்தொகை பெயரை உள்ளிடவும்', 'స్కాలర్‌షిప్ పేరు నమోదు చేయండి')}
              disabled={loading}
            />
            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Description', 'विवरण', 'விளக்கம்', 'వివరణ')} *
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
              placeholder={t('Describe the scholarship', 'छात्रवृत्ति का विवरण दें', 'உதவித்தொகையை விவரிக்கவும்', 'స్కాలర్‌షిప్‌ను వివరించండి')}
              disabled={loading}
            />
            {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Benefits', 'लाभ', 'பயன்கள்', 'ప్రయోజనాలు')}
            </label>
            <input
              type="text"
              value={form.benefits}
              onChange={e => setForm(prev => ({ ...prev, benefits: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              placeholder={t('e.g., Rs. 50,000 per year', 'उदा., प्रति वर्ष Rs. 50,000', 'உதா., ஆண்டுக்கு ரூ. 50,000', 'ఉదా., సంవత్సరానికి రూ. 50,000')}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('Deadline', 'अंतिम तिथि', 'கடைசி தேதி', 'గడువు తేదీ')}
              </label>
              <input
                type="date"
                value={form.deadline}
                onChange={e => setForm(prev => ({ ...prev, deadline: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('Official URL', 'आधिकारिक URL', 'அதிகாரப்பூர்வ URL', 'అధికారిక URL')}
              </label>
              <input
                type="url"
                value={form.officialUrl}
                onChange={e => setForm(prev => ({ ...prev, officialUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                placeholder="https://"
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Eligibility Criteria */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-1">
          {t('Eligibility Criteria', 'पात्रता मानदंड', 'தகுதி அளவுகோல்', 'అర్హత ప్రమాణాలు')}
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          {t('Leave as "All" if no restriction applies', '"सभी" रहने दें यदि कोई प्रतिबंध नहीं', '"அனைத்தும்" என்று விட்டால் கட்டுப்பாடு இல்லை', '"అన్నీ" గా ఉంచితే పరిమితి లేదు')}
        </p>
        <div className="space-y-5">
          {/* States */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('States', 'राज्य', 'மாநிலங்கள்', 'రాష్ట్రాలు')}
            </label>
            <label className="flex items-center gap-2 mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAllSelected('states')}
                onChange={() => toggleCheckbox('states', 'all')}
                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                disabled={loading}
              />
              <span className="text-sm text-gray-700">{t('All States', 'सभी राज्य', 'அனைத்து மாநிலங்கள்', 'అన్ని రాష్ట్రాలు')}</span>
            </label>
            {!isAllSelected('states') && (
              <>
                <input
                  type="text"
                  value={stateSearch}
                  onChange={e => setStateSearch(e.target.value)}
                  placeholder={t('Search states...', 'राज्य खोजें...', 'மாநிலங்களைத் தேடுங்கள்...', 'రాష్ట్రాలను వెతకండి...')}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  disabled={loading}
                />
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                  {filteredStates.map(state => (
                    <label key={state.en} className="flex items-center gap-2 cursor-pointer py-0.5">
                      <input
                        type="checkbox"
                        checked={form.eligibility.states.includes(state.en)}
                        onChange={() => toggleCheckbox('states', state.en)}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                        disabled={loading}
                      />
                      <span className="text-sm text-gray-700">{state.en}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Categories */}
          <CheckboxGroupField
            label={t('Categories', 'श्रेणियाँ', 'வகைகள்', 'వర్గాలు')}
            options={CATEGORY_OPTIONS}
            selected={form.eligibility.categories}
            field="categories"
            allLabel={t('All Categories', 'सभी श्रेणियाँ', 'அனைத்து வகைகள்', 'అన్ని వర్గాలు')}
            isAllSelected={isAllSelected('categories')}
            toggleCheckbox={toggleCheckbox}
            loading={loading}
            t={t}
          />

          {/* Education Levels */}
          <CheckboxGroupField
            label={t('Education Levels', 'शिक्षा स्तर', 'கல்வி நிலைகள்', 'విద్యా స్థాయిలు')}
            options={EDUCATION_OPTIONS}
            selected={form.eligibility.educationLevels}
            field="educationLevels"
            allLabel={t('All Levels', 'सभी स्तर', 'அனைத்து நிலைகள்', 'అన్ని స్థాయిలు')}
            isAllSelected={isAllSelected('educationLevels')}
            toggleCheckbox={toggleCheckbox}
            loading={loading}
            t={t}
          />

          {/* Max Income */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Max Family Income', 'अधिकतम पारिवारिक आय', 'அதிகபட்ச குடும்ப வருமானம்', 'గరిష్ట కుటుంబ ఆదాయం')}
            </label>
            <select
              value={form.eligibility.maxIncome}
              onChange={e => setForm(prev => ({ ...prev, eligibility: { ...prev.eligibility, maxIncome: e.target.value } }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              disabled={loading}
            >
              <option value="">{t('No Limit', 'कोई सीमा नहीं', 'வரம்பு இல்லை', 'పరిమితి లేదు')}</option>
              {INCOME_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label.en}</option>
              ))}
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Gender', 'लिंग', 'பாலினம்', 'లింగం')}
            </label>
            <div className="flex flex-wrap gap-3">
              <RadioOption value="all" label={t('All', 'सभी', 'அனைத்தும்', 'అన్నీ')} checked={form.eligibility.gender === 'all'} onChange={v => setForm(prev => ({ ...prev, eligibility: { ...prev.eligibility, gender: v } }))} disabled={loading} />
              {GENDER_OPTIONS.map(opt => (
                <RadioOption key={opt.value} value={opt.value} label={opt.label.en} checked={form.eligibility.gender === opt.value} onChange={v => setForm(prev => ({ ...prev, eligibility: { ...prev.eligibility, gender: v } }))} disabled={loading} />
              ))}
            </div>
          </div>

          {/* Disability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Disability Requirement', 'विकलांगता आवश्यकता', 'குறைபாடு தேவை', 'వైకల్య అవసరం')}
            </label>
            <div className="flex gap-3">
              <RadioOption value="false" label={t('No', 'नहीं', 'இல்லை', 'కాదు')} checked={form.eligibility.disability === 'false'} onChange={v => setForm(prev => ({ ...prev, eligibility: { ...prev.eligibility, disability: v } }))} disabled={loading} />
              <RadioOption value="true" label={t('Yes', 'हां', 'ஆம்', 'అవును')} checked={form.eligibility.disability === 'true'} onChange={v => setForm(prev => ({ ...prev, eligibility: { ...prev.eligibility, disability: v } }))} disabled={loading} />
            </div>
          </div>

          {/* Religion */}
          <CheckboxGroupField
            label={t('Religion', 'धर्म', 'மதம்', 'మతం')}
            options={RELIGION_OPTIONS}
            selected={form.eligibility.religion}
            field="religion"
            allLabel={t('All Religions', 'सभी धर्म', 'அனைத்து மதங்கள்', 'అన్ని మతాలు')}
            isAllSelected={isAllSelected('religion')}
            toggleCheckbox={toggleCheckbox}
            loading={loading}
            t={t}
          />

          {/* Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Area', 'क्षेत्र', 'பகுதி', 'ప్రాంతం')}
            </label>
            <div className="flex gap-3">
              <RadioOption value="all" label={t('All', 'सभी', 'அனைத்தும்', 'అన్నీ')} checked={form.eligibility.area === 'all'} onChange={v => setForm(prev => ({ ...prev, eligibility: { ...prev.eligibility, area: v } }))} disabled={loading} />
              {AREA_OPTIONS.map(opt => (
                <RadioOption key={opt.value} value={opt.value} label={opt.label.en} checked={form.eligibility.area === opt.value} onChange={v => setForm(prev => ({ ...prev, eligibility: { ...prev.eligibility, area: v } }))} disabled={loading} />
              ))}
            </div>
          </div>

          {/* Courses */}
          <CheckboxGroupField
            label={t('Courses', 'पाठ्यक्रम', 'படிப்புகள்', 'కోర్సులు')}
            options={COURSE_OPTIONS}
            selected={form.eligibility.courses}
            field="courses"
            allLabel={t('All Courses', 'सभी पाठ्यक्रम', 'அனைத்து படிப்புகள்', 'అన్ని కోర్సులు')}
            isAllSelected={isAllSelected('courses')}
            toggleCheckbox={toggleCheckbox}
            loading={loading}
            t={t}
          />
        </div>
      </div>

      {/* Application Details */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          {t('Application Details', 'आवेदन विवरण', 'விண்ணப்ப விவரங்கள்', 'దరఖాస్తు వివరాలు')}
        </h3>
        <div className="space-y-5">
          {/* Application Steps */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Application Steps', 'आवेदन चरण', 'விண்ணப்ப படிகள்', 'దరఖాస్తు దశలు')}
            </label>
            <div className="space-y-2">
              {form.applicationSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                  <input
                    type="text"
                    value={step}
                    onChange={e => updateListItem('applicationSteps', i, e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    placeholder={t('Describe this step', 'इस चरण का वर्णन करें', 'இந்த படியை விவரிக்கவும்', 'ఈ దశను వివరించండి')}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem('applicationSteps', i)}
                    className="text-gray-400 hover:text-red-500 p-1"
                    disabled={loading}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addListItem('applicationSteps')}
              className="mt-2 text-sm text-amber-700 hover:text-amber-800 font-medium"
              disabled={loading}
            >
              + {t('Add Step', 'चरण जोड़ें', 'படி சேர்க்கவும்', 'దశ జోడించండి')}
            </button>
          </div>

          {/* Required Documents */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Required Documents', 'आवश्यक दस्तावेज़', 'தேவையான ஆவணங்கள்', 'అవసరమైన పత్రాలు')}
            </label>
            <div className="space-y-2">
              {form.requiredDocuments.map((doc, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                  <input
                    type="text"
                    value={doc}
                    onChange={e => updateListItem('requiredDocuments', i, e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    placeholder={t('e.g., Income Certificate', 'उदा., आय प्रमाण पत्र', 'உதா., வருமான சான்றிதழ்', 'ఉదా., ఆదాయ ధృవీకరణ పత్రం')}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem('requiredDocuments', i)}
                    className="text-gray-400 hover:text-red-500 p-1"
                    disabled={loading}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addListItem('requiredDocuments')}
              className="mt-2 text-sm text-amber-700 hover:text-amber-800 font-medium"
              disabled={loading}
            >
              + {t('Add Document', 'दस्तावेज़ जोड़ें', 'ஆவணம் சேர்க்கவும்', 'పత్రం జోడించండి')}
            </button>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm text-gray-600 hover:text-gray-800 font-medium"
          disabled={loading}
        >
          {t('Cancel', 'रद्द करें', 'ரத்து செய்', 'రద్దు చేయి')}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50"
        >
          {loading
            ? t('Saving...', 'सहेज रहे हैं...', 'சேமிக்கிறது...', 'సేవ్ చేస్తోంది...')
            : isEdit
              ? t('Save Changes', 'परिवर्तन सहेजें', 'மாற்றங்களைச் சேமி', 'మార్పులు సేవ్ చేయి')
              : t('Create Scholarship', 'छात्रवृत्ति बनाएं', 'உதவித்தொகையை உருவாக்கு', 'స్కాలర్‌షిప్ సృష్టించు')
          }
        </button>
      </div>
    </form>
  )
}

// --- Helper Components ---

function RadioOption({ value, label, checked, onChange, disabled }: {
  value: string; label: string; checked: boolean; onChange: (v: string) => void; disabled: boolean
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        checked={checked}
        onChange={() => onChange(value)}
        className="border-gray-300 text-amber-600 focus:ring-amber-500"
        disabled={disabled}
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}

function CheckboxGroupField({ label, options, selected, field, allLabel, isAllSelected, toggleCheckbox, loading, t }: {
  label: string
  options: OnboardingOption[]
  selected: string[]
  field: 'states' | 'categories' | 'educationLevels' | 'religion' | 'courses'
  allLabel: string
  isAllSelected: boolean
  toggleCheckbox: (field: 'states' | 'categories' | 'educationLevels' | 'religion' | 'courses', value: string) => void
  loading: boolean
  t: (en: string, hi?: string, ta?: string, te?: string) => string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={() => toggleCheckbox(field, 'all')}
            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            disabled={loading}
          />
          <span className="text-sm text-gray-700 font-medium">{allLabel}</span>
        </label>
        {!isAllSelected && options.map(opt => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => toggleCheckbox(field, opt.value)}
              className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              disabled={loading}
            />
            <span className="text-sm text-gray-700">{opt.label.en}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
