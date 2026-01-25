import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { getRecommendations } from '../../services/apiClient';
import type { RecommendedScholarship, StudentProfileData } from '../../services/apiClient';
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

// Scholarship Card for recommendations
interface ScholarshipRecommendationCardProps {
  scholarship: RecommendedScholarship;
  t: (en: string, hi?: string, ta?: string, te?: string) => string;
  onSave: () => void;
  onApply: () => void;
  isSaved: boolean;
  index?: number;
}

function ScholarshipRecommendationCard({ scholarship, t, onSave, onApply, isSaved, index }: ScholarshipRecommendationCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="border-l-4 border-teal-600 p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-start gap-3 flex-1">
            {index !== undefined && (
              <div className="flex-shrink-0 w-7 h-7 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {index}
              </div>
            )}
            <h4 className="font-semibold text-teal-800 text-sm pt-0.5">{scholarship.name}</h4>
          </div>
          <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
            {scholarship.matchScore}% {t('match', 'मैच', 'பொருத்தம்', 'మ్యాచ్')}
          </span>
        </div>

        <p className="text-xs text-gray-600 line-clamp-2">{scholarship.description}</p>

        {scholarship.matchReasons && scholarship.matchReasons.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {scholarship.matchReasons.slice(0, 3).map((reason, i) => (
              <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-teal-50 text-teal-700">
                {reason}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            {scholarship.benefits}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            {t('Deadline:', 'अंतिम तिथि:', 'காலக்கெடு:', 'గడువు:')} {scholarship.deadline}
          </span>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-700 mb-1">
              {t('How to Apply:', 'आवेदन कैसे करें:', 'எப்படி விண்ணப்பிப்பது:', 'ఎలా దరఖాస్తు చేయాలి:')}
            </p>
            <ol className="list-decimal list-inside text-xs text-gray-600 space-y-0.5">
              {scholarship.applicationSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={onSave}
            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              isSaved
                ? 'bg-amber-100 text-amber-700'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {isSaved ? t('Saved', 'सहेजा गया', 'சேமிக்கப்பட்டது', 'సేవ్ చేయబడింది') : t('Save', 'सहेजें', 'சேமி', 'సేవ్')}
          </button>
          {scholarship.officialUrl && (
            <a
              href={scholarship.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onApply}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-teal-700 text-white text-sm font-medium rounded-lg hover:bg-teal-800 transition-colors"
            >
              {t('Apply Now', 'अभी आवेदन करें', 'இப்போது விண்ணப்பிக்கவும்', 'ఇప్పుడు దరఖాస్తు చేయండి')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-2 text-xs text-teal-700 hover:text-teal-900"
        >
          {expanded ? t('Show less', 'कम दिखाएं', 'குறைவாகக் காட்டு', 'తక్కువ చూపించు') : t('Show more', 'और दिखाएं', 'மேலும் காட்டு', 'మరింత చూపించు')}
        </button>
      </div>
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
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  // Load saved scholarships from localStorage
  useEffect(() => {
    if (user?.id) {
      try {
        const saved = localStorage.getItem(`saved_scholarships_${user.id}`);
        const applied = localStorage.getItem(`scholarship_applications_${user.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          setSavedIds(new Set(parsed.map((s: { id: string }) => s.id)));
        }
        if (applied) {
          const parsed = JSON.parse(applied);
          setAppliedIds(new Set(parsed.map((s: { scholarshipId: string }) => s.scholarshipId)));
        }
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
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

  // Save scholarship
  const handleSave = (scholarship: RecommendedScholarship) => {
    if (!user?.id) return;

    const savedKey = `saved_scholarships_${user.id}`;
    try {
      const existing = localStorage.getItem(savedKey);
      const saved = existing ? JSON.parse(existing) : [];

      if (savedIds.has(scholarship.id)) {
        // Remove from saved
        const updated = saved.filter((s: { id: string }) => s.id !== scholarship.id);
        localStorage.setItem(savedKey, JSON.stringify(updated));
        setSavedIds(prev => {
          const next = new Set(prev);
          next.delete(scholarship.id);
          return next;
        });
      } else {
        // Add to saved
        saved.push({
          id: scholarship.id,
          name: scholarship.name,
          description: scholarship.description,
          benefits: scholarship.benefits,
          deadline: scholarship.deadline,
          officialUrl: scholarship.officialUrl,
          savedAt: new Date().toISOString(),
        });
        localStorage.setItem(savedKey, JSON.stringify(saved));
        setSavedIds(prev => new Set(prev).add(scholarship.id));
      }
    } catch (error) {
      console.error('Failed to save scholarship:', error);
    }
  };

  // Track application
  const handleApply = (scholarship: RecommendedScholarship) => {
    if (!user?.id || appliedIds.has(scholarship.id)) return;

    const appliedKey = `scholarship_applications_${user.id}`;
    try {
      const existing = localStorage.getItem(appliedKey);
      const applied = existing ? JSON.parse(existing) : [];

      applied.push({
        id: `app_${scholarship.id}_${Date.now()}`,
        scholarshipId: scholarship.id,
        name: scholarship.name,
        description: scholarship.description,
        benefits: scholarship.benefits,
        appliedAt: new Date().toISOString(),
        status: 'applied',
        officialUrl: scholarship.officialUrl,
      });
      localStorage.setItem(appliedKey, JSON.stringify(applied));
      setAppliedIds(prev => new Set(prev).add(scholarship.id));
    } catch (error) {
      console.error('Failed to track application:', error);
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
                value={formData.disability === true ? 'true' : formData.disability === false ? 'false' : ''}
                options={AREA_OPTIONS}
                onChange={(v) => updateField('disability', v === 'urban' ? false : v === 'rural' ? true : undefined)}
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
                value={''}
                options={RELIGION_OPTIONS}
                onChange={() => {}}
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
                <div className="mt-3 bg-teal-50 border border-teal-200 rounded-lg p-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {recommendations.length}
                  </div>
                  <span className="text-teal-800 font-medium text-sm">
                    {t(
                      `Scholarship${recommendations.length !== 1 ? 's' : ''} found!`,
                      `छात्रवृत्ति${recommendations.length !== 1 ? 'यां' : ''} मिलीं!`,
                      `உதவித்தொகை${recommendations.length !== 1 ? 'கள்' : ''} கிடைத்தன!`,
                      `స్కాలర్‌షిప్${recommendations.length !== 1 ? 'లు' : ''} దొరికాయి!`
                    )}
                  </span>
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
                <div className="space-y-4">
                  {recommendations.map((scholarship, index) => (
                    <ScholarshipRecommendationCard
                      key={scholarship.id}
                      scholarship={scholarship}
                      t={t}
                      onSave={() => handleSave(scholarship)}
                      onApply={() => handleApply(scholarship)}
                      isSaved={savedIds.has(scholarship.id)}
                      index={index + 1}
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
