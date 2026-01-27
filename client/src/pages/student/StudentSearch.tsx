import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import ScholarshipCard from '../../components/ScholarshipCard';
import {
  getRecommendations,
  getSavedScholarships,
  saveScholarship,
  unsaveScholarship
} from '../../services/apiClient';
import type { RecommendedScholarship, StudentProfileData, ScholarshipResult } from '../../services/apiClient';
import { INDIAN_STATES } from '../../constants/states';
import {
  CATEGORY_OPTIONS,
  EDUCATION_OPTIONS,
  INCOME_OPTIONS,
  GENDER_OPTIONS,
  DISABILITY_OPTIONS,
  RELIGION_OPTIONS,
  AREA_OPTIONS,
  COURSE_OPTIONS,
} from '../../constants/onboardingOptions';
import type { OnboardingOption } from '../../constants/onboardingOptions';

// Chevron Icon
function ChevronDown({ className, rotated }: { className?: string; rotated?: boolean }) {
  return (
    <svg
      className={`${className} transition-transform duration-200 ${rotated ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// Form section component
interface FormSectionProps {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  isComplete: boolean;
  children: React.ReactNode;
}

function FormSection({ title, subtitle, isOpen, onToggle, isComplete, children }: FormSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            isComplete ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
          }`}>
            {isComplete ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : null}
          </div>
          <div>
            <h3 className="font-medium text-gray-800">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <ChevronDown className="w-5 h-5 text-gray-400" rotated={isOpen} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

// Dropdown component
interface DropdownProps {
  label: string;
  value: string;
  options: OnboardingOption[];
  onChange: (value: string) => void;
  language: string;
  placeholder?: string;
}

function Dropdown({ label, value, options, onChange, language, placeholder }: DropdownProps) {
  const getLabel = (opt: OnboardingOption) => {
    switch (language) {
      case 'hi': return opt.label.hi;
      case 'ta': return opt.label.ta;
      case 'te': return opt.label.te;
      default: return opt.label.en;
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
      >
        <option value="">{placeholder || 'Select...'}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {getLabel(opt)}
          </option>
        ))}
      </select>
    </div>
  );
}

// State dropdown with search
interface StateDropdownProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  label: string;
}

function StateDropdown({ value, onChange, language, label }: StateDropdownProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
      >
        <option value="">Select state...</option>
        {INDIAN_STATES.map((state) => (
          <option key={state.en} value={state.en}>
            {language === 'hi' ? state.hi : state.en}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function StudentSearch() {
  const { language, t } = useLanguage();
  const { user, profile } = useAuth();

  // Form state
  const [formData, setFormData] = useState<StudentProfileData>({
    state: '',
    category: '',
    educationLevel: '',
    income: '',
    gender: '',
    disability: undefined,
    religion: '',
    area: '',
    course: '',
  });

  // Section open states
  const [openSections, setOpenSections] = useState({
    personal: true,
    education: false,
    financial: false,
    other: false,
  });

  // Recommendations state
  const [recommendations, setRecommendations] = useState<RecommendedScholarship[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Load saved scholarships from backend API
  useEffect(() => {
    const loadSaved = async () => {
      if (!user?.id) return;
      try {
        const { scholarships } = await getSavedScholarships(user.id, 'student');
        setSavedIds(new Set(scholarships.map(s => s.id)));
      } catch (error) {
        console.error('Failed to load saved scholarships:', error);
      }
    };
    loadSaved();
  }, [user?.id]);

  // Auto-populate from profile
  const handleAutoPopulate = useCallback(() => {
    if (profile) {
      setFormData({
        state: profile.state || '',
        category: profile.category || '',
        educationLevel: profile.educationLevel || '',
        income: profile.income || '',
        gender: profile.gender || '',
        disability: profile.disability,
        religion: profile.religion || '',
        area: profile.area || '',
        course: profile.course || '',
      });
    }
  }, [profile]);

  // Check if profile has data to auto-populate
  const hasProfileData = profile && (profile.state || profile.category || profile.educationLevel);

  // Fetch recommendations when form changes
  const fetchRecommendations = useCallback(async () => {
    // Only fetch if we have at least one filter set
    const hasFilters = Object.values(formData).some(v => v !== '' && v !== undefined);
    if (!hasFilters) {
      setRecommendations([]);
      return;
    }

    setLoading(true);
    try {
      const response = await getRecommendations(formData);
      setRecommendations(response.recommendations);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, [formData]);

  // Debounced fetch on form change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecommendations();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchRecommendations]);

  // Toggle section
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Update form field
  const updateField = (field: keyof StudentProfileData, value: string | boolean | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Check section completion
  const isSectionComplete = (section: string): boolean => {
    switch (section) {
      case 'personal':
        return !!(formData.state && formData.gender);
      case 'education':
        return !!(formData.educationLevel && formData.course);
      case 'financial':
        return !!formData.income;
      case 'other':
        return !!(formData.category);
      default:
        return false;
    }
  };

  // Save scholarship using backend API
  const handleSave = async (scholarship: ScholarshipResult & { type?: 'public' | 'private' }) => {
    if (!user?.id) return;

    try {
      await saveScholarship(
        {
          id: scholarship.id,
          name: scholarship.name,
          description: scholarship.description || '',
          benefits: scholarship.benefits,
          deadline: scholarship.deadline,
          officialUrl: scholarship.officialUrl,
          type: scholarship.type || 'public'
        },
        user.id,
        'student'
      );
      setSavedIds(prev => new Set(prev).add(scholarship.id));
    } catch (error) {
      console.error('Failed to save scholarship:', error);
    }
  };

  // Unsave scholarship using backend API
  const handleUnsave = async (scholarshipId: string) => {
    if (!user?.id) return;

    try {
      await unsaveScholarship(scholarshipId, user.id, 'student');
      setSavedIds(prev => {
        const next = new Set(prev);
        next.delete(scholarshipId);
        return next;
      });
    } catch (error) {
      console.error('Failed to unsave scholarship:', error);
    }
  };

  // Calculate completion percentage
  const completedSections = ['personal', 'education', 'financial', 'other'].filter(s => isSectionComplete(s)).length;
  const completionPercentage = Math.round((completedSections / 4) * 100);

  return (
    <div className="h-full">
      {/* Header */}
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {t('Find Scholarships', 'छात्रवृत्ति खोजें', 'உதவித்தொகைகளைக் கண்டறியவும்', 'స్కాలర్‌షిప్‌లను కనుగొనండి')}
          </h1>
          <p className="mt-1 text-text-secondary">
            {t(
              'Fill in your details to find matching scholarships',
              'मिलती-जुलती छात्रवृत्तियां खोजने के लिए अपना विवरण भरें',
              'பொருத்தமான உதவித்தொகைகளைக் கண்டறிய உங்கள் விவரங்களை நிரப்பவும்',
              'సరిపోలే స్కాలర్‌షిప్‌లను కనుగొనడానికి మీ వివరాలను నమోదు చేయండి'
            )}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{t('Form completion', 'फॉर्म पूर्णता', 'படிவம் நிறைவு', 'ఫారం పూర్తి')}</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content - two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column - Form */}
        <div className="lg:col-span-5 space-y-4">
          {/* Auto-fill from Profile button - positioned above form */}
          {hasProfileData && (
            <Button
              variant="primary"
              size="md"
              onClick={handleAutoPopulate}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('Auto-fill from Profile', 'प्रोफ़ाइल से भरें', 'சுயவிவரத்திலிருந்து நிரப்பு', 'ప్రొఫైల్ నుండి నింపండి')}
            </Button>
          )}

          {/* Personal Details Section */}
          <FormSection
            title={t('Personal Details', 'व्यक्तिगत विवरण', 'தனிப்பட்ட விவரங்கள்', 'వ్యక్తిగత వివరాలు')}
            subtitle={t('State, gender, and location', 'राज्य, लिंग और स्थान', 'மாநிலம், பாலினம் மற்றும் இடம்', 'రాష్ట్రం, లింగం మరియు స్థానం')}
            isOpen={openSections.personal}
            onToggle={() => toggleSection('personal')}
            isComplete={isSectionComplete('personal')}
          >
            <div className="space-y-4">
              <StateDropdown
                value={formData.state || ''}
                onChange={(v) => updateField('state', v)}
                language={language}
                label={t('State', 'राज्य', 'மாநிலம்', 'రాష్ట్రం')}
              />
              <Dropdown
                label={t('Gender', 'लिंग', 'பாலினம்', 'లింగం')}
                value={formData.gender || ''}
                options={GENDER_OPTIONS}
                onChange={(v) => updateField('gender', v)}
                language={language}
              />
              <Dropdown
                label={t('Area', 'क्षेत्र', 'பகுதி', 'ప్రాంతం')}
                value={formData.area || ''}
                options={AREA_OPTIONS}
                onChange={(v) => updateField('area', v)}
                language={language}
              />
            </div>
          </FormSection>

          {/* Education Section */}
          <FormSection
            title={t('Education', 'शिक्षा', 'கல்வி', 'విద్య')}
            subtitle={t('Current education level and course', 'वर्तमान शिक्षा स्तर और पाठ्यक्रम', 'தற்போதைய கல்வி நிலை மற்றும் படிப்பு', 'ప్రస్తుత విద్యా స్థాయి మరియు కోర్సు')}
            isOpen={openSections.education}
            onToggle={() => toggleSection('education')}
            isComplete={isSectionComplete('education')}
          >
            <div className="space-y-4">
              <Dropdown
                label={t('Education Level', 'शिक्षा स्तर', 'கல்வி நிலை', 'విద్యా స్థాయి')}
                value={formData.educationLevel || ''}
                options={EDUCATION_OPTIONS}
                onChange={(v) => updateField('educationLevel', v)}
                language={language}
              />
              <Dropdown
                label={t('Course / Field of Study', 'पाठ्यक्रम / अध्ययन क्षेत्र', 'படிப்பு / துறை', 'కోర్సు / అధ్యయన రంగం')}
                value={formData.course || ''}
                options={COURSE_OPTIONS}
                onChange={(v) => updateField('course', v)}
                language={language}
              />
            </div>
          </FormSection>

          {/* Financial Section */}
          <FormSection
            title={t('Financial Information', 'आर्थिक जानकारी', 'நிதி தகவல்', 'ఆర్థిక సమాచారం')}
            subtitle={t('Annual family income', 'वार्षिक पारिवारिक आय', 'ஆண்டு குடும்ப வருமானம்', 'వార్షిక కుటుంబ ఆదాయం')}
            isOpen={openSections.financial}
            onToggle={() => toggleSection('financial')}
            isComplete={isSectionComplete('financial')}
          >
            <div className="space-y-4">
              <Dropdown
                label={t('Annual Family Income', 'वार्षिक पारिवारिक आय', 'ஆண்டு குடும்ப வருமானம்', 'వార్షిక కుటుంబ ఆదాయం')}
                value={formData.income || ''}
                options={INCOME_OPTIONS}
                onChange={(v) => updateField('income', v)}
                language={language}
              />
            </div>
          </FormSection>

          {/* Other Details Section */}
          <FormSection
            title={t('Other Details', 'अन्य विवरण', 'பிற விவரங்கள்', 'ఇతర వివరాలు')}
            subtitle={t('Category, religion, and disability status', 'श्रेणी, धर्म और विकलांगता स्थिति', 'வகை, மதம் மற்றும் குறைபாடு நிலை', 'వర్గం, మతం మరియు వికలాంగత్వ స్థితి')}
            isOpen={openSections.other}
            onToggle={() => toggleSection('other')}
            isComplete={isSectionComplete('other')}
          >
            <div className="space-y-4">
              <Dropdown
                label={t('Category', 'श्रेणी', 'வகை', 'వర్గం')}
                value={formData.category || ''}
                options={CATEGORY_OPTIONS}
                onChange={(v) => updateField('category', v)}
                language={language}
              />
              <Dropdown
                label={t('Religion', 'धर्म', 'மதம்', 'మతం')}
                value={formData.religion || ''}
                options={RELIGION_OPTIONS}
                onChange={(v) => updateField('religion', v)}
                language={language}
              />
              <Dropdown
                label={t('Disability (40% or more)', 'विकलांगता (40% या अधिक)', 'குறைபாடு (40% அல்லது அதற்கு மேல்)', 'వికలాంగత్వం (40% లేదా అంతకంటే ఎక్కువ)')}
                value={formData.disability === true ? 'true' : formData.disability === false ? 'false' : ''}
                options={DISABILITY_OPTIONS}
                onChange={(v) => updateField('disability', v === 'true')}
                language={language}
              />
            </div>
          </FormSection>

          {/* Tip Card */}
          <Card padding="md" className="bg-teal-50 border border-teal-200">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-teal-800">
                  {t('Tip', 'टिप', 'குறிப்பு', 'చిట్కా')}
                </h4>
                <p className="mt-1 text-xs text-teal-700">
                  {t(
                    'Fill more details to get better scholarship matches. You can also use the Chat Assistant for personalized advice.',
                    'बेहतर छात्रवृत्ति मिलान पाने के लिए अधिक विवरण भरें। व्यक्तिगत सलाह के लिए चैट सहायक का भी उपयोग करें।',
                    'சிறந்த உதவித்தொகை பொருத்தங்களைப் பெற மேலும் விவரங்களை நிரப்பவும். தனிப்பயனாக்கப்பட்ட ஆலோசனைக்கு அரட்டை உதவியாளரையும் பயன்படுத்தலாம்.',
                    'మెరుగైన స్కాలర్‌షిప్ సరిపోలికలను పొందడానికి మరిన్ని వివరాలను నమోదు చేయండి. వ్యక్తిగత సలహా కోసం చాట్ అసిస్టెంట్‌ను కూడా ఉపయోగించవచ్చు.'
                  )}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column - Recommendations */}
        <div className="lg:col-span-7">
          <Card padding="none" className="sticky top-4">
            <div className="p-4 border-b border-gray-100">
              <CardHeader
                title={t('Matching Scholarships', 'मिलती-जुलती छात्रवृत्तियां', 'பொருந்தும் உதவித்தொகைகள்', 'సరిపోలే స్కాలర్‌షిప్‌లు')}
                subtitle={
                  loading
                    ? t('Searching...', 'खोज रहे हैं...', 'தேடுகிறது...', 'శోధిస్తోంది...')
                    : t('Fill in your details to see matches', 'मैच देखने के लिए अपना विवरण भरें', 'பொருத்தங்களைக் காண உங்கள் விவரங்களை நிரப்பவும்', 'సరిపోలికలను చూడటానికి మీ వివరాలను నమోదు చేయండి')
                }
              />
              {/* Prominent count display */}
              {recommendations.length > 0 && !loading && (
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="font-semibold">{recommendations.filter(s => s.type === 'public').length}</span>
                    <span>{t('Government', 'सरकारी', 'அரசு', 'ప్రభుత్వ')}</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="font-semibold">{recommendations.filter(s => s.type === 'private').length}</span>
                    <span>{t('Private', 'निजी', 'தனியார்', 'ప్రైవేట్')}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 max-h-[calc(100vh-220px)] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : recommendations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-800 mb-1">
                    {t('No results yet', 'अभी तक कोई परिणाम नहीं', 'இன்னும் முடிவுகள் இல்லை', 'ఇంకా ఫలితాలు లేవు')}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {t(
                      'Fill in your details on the left to find matching scholarships',
                      'मिलती-जुलती छात्रवृत्तियां खोजने के लिए बाईं ओर अपना विवरण भरें',
                      'பொருந்தும் உதவித்தொகைகளைக் கண்டறிய இடதுபுறத்தில் உங்கள் விவரங்களை நிரப்பவும்',
                      'సరిపోలే స్కాలర్‌షిప్‌లను కనుగొనడానికి ఎడమ వైపు మీ వివరాలను నమోదు చేయండి'
                    )}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Government Scholarships Section */}
                  {recommendations.filter(s => s.type === 'public').length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-sm font-medium text-gray-700">
                          {t('Government Scholarships', 'सरकारी छात्रवृत्तियां', 'அரசு உதவித்தொகைகள்', 'ప్రభుత్వ స్కాలర్‌షిప్‌లు')}
                        </h3>
                        <span className="text-xs text-gray-400">
                          ({recommendations.filter(s => s.type === 'public').length})
                        </span>
                      </div>
                      <div className="space-y-3">
                        {recommendations
                          .filter(s => s.type === 'public')
                          .map((scholarship) => (
                            <ScholarshipCard
                              key={scholarship.id}
                              scholarship={scholarship}
                              t={t}
                              matchScore={scholarship.matchScore}
                              matchReasons={scholarship.matchReasons}
                              isSaved={savedIds.has(scholarship.id)}
                              onSave={handleSave}
                              onUnsave={handleUnsave}
                            />
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Private Scholarships Section */}
                  {recommendations.filter(s => s.type === 'private').length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-sm font-medium text-gray-700">
                          {t('Private Scholarships', 'निजी छात्रवृत्तियां', 'தனியார் உதவித்தொகைகள்', 'ప్రైవేట్ స్కాలర్‌షిప్‌లు')}
                        </h3>
                        <span className="text-xs text-gray-400">
                          ({recommendations.filter(s => s.type === 'private').length})
                        </span>
                      </div>
                      <div className="space-y-3">
                        {recommendations
                          .filter(s => s.type === 'private')
                          .map((scholarship) => (
                            <ScholarshipCard
                              key={scholarship.id}
                              scholarship={scholarship}
                              t={t}
                              matchScore={scholarship.matchScore}
                              matchReasons={scholarship.matchReasons}
                              isSaved={savedIds.has(scholarship.id)}
                              onSave={handleSave}
                              onUnsave={handleUnsave}
                            />
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
