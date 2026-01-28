import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import VoiceSearch from '../../components/VoiceSearch';
import {
  getRecommendations,
  getSavedScholarships,
  saveScholarship,
  unsaveScholarship
} from '../../services/apiClient';
import type { RecommendedScholarship, StudentProfileData } from '../../services/apiClient';
import { INDIAN_STATES } from '../../constants/states';
import { EDUCATION_OPTIONS } from '../../constants/onboardingOptions';

// Compact Scholarship Card Component
interface CompactCardProps {
  scholarship: RecommendedScholarship;
  isSaved: boolean;
  onClick: () => void;
  t: (en: string, hi: string, ta: string, te: string) => string;
}

function CompactScholarshipCard({ scholarship, isSaved, onClick, t }: CompactCardProps) {
  const daysLeft = Math.ceil(
    (new Date(scholarship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isUrgent = daysLeft <= 7 && daysLeft > 0;
  const isClosed = daysLeft <= 0;

  // Extract benefit amount
  const benefitMatch = scholarship.benefits.match(/₹?\s*([\d,]+)/);
  const benefitAmount = benefitMatch ? `₹${benefitMatch[1]}` : scholarship.benefits.slice(0, 30);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 hover:border-teal-300 hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 group-hover:text-teal-700">
          {scholarship.name}
        </h3>
        {isSaved && (
          <span className="shrink-0 text-teal-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </span>
        )}
      </div>

      <p className="text-teal-700 font-medium text-sm mb-2">{benefitAmount}</p>

      <div className="flex items-center justify-between">
        <span className={`text-xs flex items-center gap-1 ${
          isClosed ? 'text-gray-400' : isUrgent ? 'text-red-600' : 'text-gray-500'
        }`}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {isClosed
            ? t('Closed', 'बंद', 'மூடப்பட்டது', 'మూసివేయబడింది')
            : `${daysLeft} ${t('days left', 'दिन बाकी', 'நாட்கள் உள்ளன', 'రోజులు మిగిలి ఉన్నాయి')}`
          }
        </span>

        {scholarship.matchScore && (
          <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">
            {scholarship.matchScore}% {t('match', 'मैच', 'பொருத்தம்', 'సరిపోలిక')}
          </span>
        )}
      </div>
    </button>
  );
}

// Side Panel Component
interface SidePanelProps {
  scholarship: RecommendedScholarship | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onSave: () => void;
  onUnsave: () => void;
  t: (en: string, hi: string, ta: string, te: string) => string;
}

function SidePanel({ scholarship, isOpen, onClose, isSaved, onSave, onUnsave, t }: SidePanelProps) {
  if (!scholarship) return null;

  const daysLeft = Math.ceil(
    (new Date(scholarship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              scholarship.type === 'public'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-purple-50 text-purple-700'
            }`}>
              {scholarship.type === 'public'
                ? t('Government', 'सरकारी', 'அரசு', 'ప్రభుత్వ')
                : t('Private', 'निजी', 'தனியார்', 'ప్రైవేట్')
              }
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <h2 className="text-xl font-bold text-gray-800">{scholarship.name}</h2>

            {/* Benefits */}
            <div className="bg-teal-50 rounded-lg p-3">
              <p className="text-teal-800 font-semibold text-lg">{scholarship.benefits}</p>
            </div>

            {/* Deadline */}
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {t('Deadline:', 'अंतिम तिथि:', 'காலக்கெடு:', 'గడువు:')} {new Date(scholarship.deadline).toLocaleDateString()}
                {daysLeft > 0 && (
                  <span className={`ml-2 text-sm ${daysLeft <= 7 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                    ({daysLeft} {t('days left', 'दिन बाकी', 'நாட்கள்', 'రోజులు')})
                  </span>
                )}
              </span>
            </div>

            {/* Match Score */}
            {scholarship.matchScore && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {t('Match Score', 'मैच स्कोर', 'பொருத்த மதிப்பெண்', 'సరిపోలిక స్కోర్')}
                  </span>
                  <span className="text-teal-700 font-bold">{scholarship.matchScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-teal-600 h-2 rounded-full transition-all"
                    style={{ width: `${scholarship.matchScore}%` }}
                  />
                </div>
              </div>
            )}

            {/* Match Reasons */}
            {scholarship.matchReasons && scholarship.matchReasons.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {t('Why you match:', 'आप क्यों योग्य हैं:', 'நீங்கள் ஏன் பொருந்துகிறீர்கள்:', 'మీరు ఎందుకు సరిపోతారు:')}
                </h4>
                <ul className="space-y-1">
                  {scholarship.matchReasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            {scholarship.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">
                  {t('Description', 'विवरण', 'விளக்கம்', 'వివరణ')}
                </h4>
                <p className="text-sm text-gray-600">{scholarship.description}</p>
              </div>
            )}

            {/* Donor */}
            {scholarship.donorName && (
              <div className="text-sm text-gray-500">
                {t('By:', 'द्वारा:', 'வழங்குபவர்:', 'ద్వారా:')} {scholarship.donorName}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-100 flex gap-3">
            <button
              onClick={isSaved ? onUnsave : onSave}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                isSaved
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className={`w-5 h-5 ${isSaved ? 'text-teal-600' : ''}`} fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {isSaved
                ? t('Saved', 'सहेजा', 'சேமிக்கப்பட்டது', 'సేవ్ చేయబడింది')
                : t('Save', 'सहेजें', 'சேமி', 'సేవ్')
              }
            </button>
            <a
              href={scholarship.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-xl font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
            >
              {t('Apply Now', 'अभी आवेदन करें', 'இப்போது விண்ணப்பிக்கவும்', 'ఇప్పుడు దరఖాస్తు చేయండి')}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default function StudentSearch() {
  const { language, t } = useLanguage();
  const { user, profile } = useAuth();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedEducation, setSelectedEducation] = useState('');
  const [activeTab, setActiveTab] = useState<'government' | 'private'>('government');

  // Results state
  const [recommendations, setRecommendations] = useState<RecommendedScholarship[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Side panel state
  const [selectedScholarship, setSelectedScholarship] = useState<RecommendedScholarship | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Load saved scholarships
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

  // Auto-populate from profile on mount
  useEffect(() => {
    if (profile) {
      if (profile.state) setSelectedState(profile.state);
      if (profile.educationLevel) setSelectedEducation(profile.educationLevel);
    }
  }, [profile]);

  // Fetch recommendations
  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const profileData: StudentProfileData = {
        state: selectedState || undefined,
        educationLevel: selectedEducation || undefined,
        // Include profile data for better matching
        category: profile?.category,
        income: profile?.income,
        gender: profile?.gender,
        disability: profile?.disability,
        religion: profile?.religion,
        area: profile?.area,
        course: profile?.course,
      };

      const response = await getRecommendations(profileData);

      // Filter by search query if present
      let results = response.recommendations;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        results = results.filter(s =>
          s.name.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          s.benefits.toLowerCase().includes(query)
        );
      }

      setRecommendations(results);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedState, selectedEducation, searchQuery, profile]);

  // Debounced fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecommendations();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchRecommendations]);

  // Handle voice filters
  const handleVoiceFilters = useCallback((filters: Partial<StudentProfileData>) => {
    if (filters.state) setSelectedState(filters.state);
    if (filters.educationLevel) setSelectedEducation(filters.educationLevel);
  }, []);

  // Handle voice transcript
  const handleVoiceTranscript = useCallback((transcript: string) => {
    setSearchQuery(transcript);
  }, []);

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedState('');
    setSelectedEducation('');
  };

  // Save/unsave handlers
  const handleSave = async (scholarship: RecommendedScholarship) => {
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
          type: scholarship.type
        },
        user.id,
        'student'
      );
      setSavedIds(prev => new Set(prev).add(scholarship.id));
    } catch (error) {
      console.error('Failed to save scholarship:', error);
    }
  };

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

  // Open scholarship details
  const openScholarshipDetails = (scholarship: RecommendedScholarship) => {
    setSelectedScholarship(scholarship);
    setIsPanelOpen(true);
  };

  // Filter by tab
  const governmentScholarships = recommendations.filter(s => s.type === 'public');
  const privateScholarships = recommendations.filter(s => s.type === 'private');
  const displayedScholarships = activeTab === 'government' ? governmentScholarships : privateScholarships;

  const hasFilters = searchQuery || selectedState || selectedEducation;

  return (
    <div className="h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {t('Find Scholarships', 'छात्रवृत्ति खोजें', 'உதவித்தொகைகளைக் கண்டறியவும்', 'స్కాలర్‌షిప్‌లను కనుగొనండి')}
        </h1>
        <p className="mt-1 text-gray-500">
          {t(
            'Discover opportunities that match your profile',
            'अपनी प्रोफ़ाइल से मेल खाने वाले अवसर खोजें',
            'உங்கள் சுயவிவரத்துடன் பொருந்தும் வாய்ப்புகளைக் கண்டறியவும்',
            'మీ ప్రొఫైల్‌కు సరిపోలే అవకాశాలను కనుగొనండి'
          )}
        </p>
      </div>

      {/* Search Bar + Voice */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(
              'Search scholarships...',
              'छात्रवृत्ति खोजें...',
              'உதவித்தொகைகளைத் தேடுங்கள்...',
              'స్కాలర్‌షిప్‌లను శోధించండి...'
            )}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
          />
        </div>
        <VoiceSearch
          onFiltersExtracted={handleVoiceFilters}
          onTranscript={handleVoiceTranscript}
          t={t}
          compact
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-2 mb-6">
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none bg-white"
        >
          <option value="">{t('All States', 'सभी राज्य', 'அனைத்து மாநிலங்கள்', 'అన్ని రాష్ట్రాలు')}</option>
          {INDIAN_STATES.map((state) => (
            <option key={state.en} value={state.en}>
              {language === 'hi' ? state.hi : state.en}
            </option>
          ))}
        </select>

        <select
          value={selectedEducation}
          onChange={(e) => setSelectedEducation(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none bg-white"
        >
          <option value="">{t('All Education Levels', 'सभी शिक्षा स्तर', 'அனைத்து கல்வி நிலைகள்', 'అన్ని విద్యా స్థాయిలు')}</option>
          {EDUCATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {language === 'hi' ? opt.label.hi : language === 'ta' ? opt.label.ta : language === 'te' ? opt.label.te : opt.label.en}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t('Clear', 'साफ़ करें', 'அழி', 'క్లియర్')}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('government')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'government'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {t('Government', 'सरकारी', 'அரசு', 'ప్రభుత్వ')}
            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">
              {governmentScholarships.length}
            </span>
          </span>
        </button>
        <button
          onClick={() => setActiveTab('private')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'private'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {t('Private', 'निजी', 'தனியார்', 'ప్రైవేట్')}
            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">
              {privateScholarships.length}
            </span>
          </span>
        </button>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : displayedScholarships.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-800 mb-1">
            {t('No scholarships found', 'कोई छात्रवृत्ति नहीं मिली', 'உதவித்தொகைகள் இல்லை', 'స్కాలర్‌షిప్‌లు కనుగొనబడలేదు')}
          </h3>
          <p className="text-xs text-gray-500">
            {t(
              'Try adjusting your search or filters',
              'अपनी खोज या फ़िल्टर बदलें',
              'உங்கள் தேடலை அல்லது வடிகட்டிகளை மாற்றவும்',
              'మీ శోధన లేదా ఫిల్టర్‌లను మార్చండి'
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedScholarships.map((scholarship) => (
            <CompactScholarshipCard
              key={scholarship.id}
              scholarship={scholarship}
              isSaved={savedIds.has(scholarship.id)}
              onClick={() => openScholarshipDetails(scholarship)}
              t={t}
            />
          ))}
        </div>
      )}

      {/* Side Panel */}
      <SidePanel
        scholarship={selectedScholarship}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        isSaved={selectedScholarship ? savedIds.has(selectedScholarship.id) : false}
        onSave={() => selectedScholarship && handleSave(selectedScholarship)}
        onUnsave={() => selectedScholarship && handleUnsave(selectedScholarship.id)}
        t={t}
      />
    </div>
  );
}
