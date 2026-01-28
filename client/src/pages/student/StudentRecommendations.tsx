import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import ScholarshipCard from '../../components/ScholarshipCard';
import ProfileSlidePanel from '../../components/ProfileSlidePanel';
import { getRecommendations, getSavedScholarships, saveScholarship, unsaveScholarship } from '../../services/apiClient';
import type { RecommendedScholarship, ScholarshipResult } from '../../services/apiClient';
import {
  countUrgentScholarships,
  calculateTotalPotential,
  formatBenefitAmount,
  getDaysUntilDeadline,
  parseBenefitAmount
} from '../../utils/deadlineUtils';

type ScholarshipFilter = 'all' | 'government' | 'private';
type SortOption = 'match' | 'deadline' | 'benefit';

export default function StudentRecommendations() {
  const { t } = useLanguage();
  const { user, profile, profileComplete } = useAuth();

  const [recommendations, setRecommendations] = useState<RecommendedScholarship[]>([]);
  const [semanticSuggestions, setSemanticSuggestions] = useState<RecommendedScholarship[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [matchingStrategy, setMatchingStrategy] = useState<'rule-based' | 'hybrid'>('rule-based');
  const [useSemanticMatching, setUseSemanticMatching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ScholarshipFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('match');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Load saved scholarships on mount
  useEffect(() => {
    const loadSavedIds = async () => {
      if (!user) return;
      try {
        const { scholarships } = await getSavedScholarships(user.id, 'student');
        setSavedIds(new Set(scholarships.map(s => s.id)));
      } catch (err) {
        console.error('Failed to load saved scholarships:', err);
      }
    };
    loadSavedIds();
  }, [user]);

  // Filter scholarships by type
  const filteredRecommendations = useMemo(() => {
    let filtered = recommendations;
    if (activeFilter !== 'all') {
      const filterType = activeFilter === 'government' ? 'public' : 'private';
      filtered = recommendations.filter(s => s.type === filterType);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return getDaysUntilDeadline(a.deadline) - getDaysUntilDeadline(b.deadline);
        case 'benefit':
          return parseBenefitAmount(b.benefits) - parseBenefitAmount(a.benefits);
        case 'match':
        default:
          return b.matchScore - a.matchScore;
      }
    });

    return sorted;
  }, [recommendations, activeFilter, sortBy]);

  // Count scholarships by type
  const counts = useMemo(() => ({
    all: recommendations.length,
    government: recommendations.filter(s => s.type === 'public').length,
    private: recommendations.filter(s => s.type === 'private').length,
  }), [recommendations]);

  // Stats calculations
  const stats = useMemo(() => ({
    total: recommendations.length,
    urgent: countUrgentScholarships(recommendations),
    potential: calculateTotalPotential(recommendations)
  }), [recommendations]);

  const fetchRecommendations = async (withSemantic?: boolean) => {
    if (!user) return;

    const semanticEnabled = withSemantic ?? useSemanticMatching;
    setLoading(true);
    setError(null);

    try {
      const profileData = {
        state: user.user_metadata?.state,
        category: user.user_metadata?.category,
        educationLevel: user.user_metadata?.educationLevel,
        income: user.user_metadata?.income,
        gender: user.user_metadata?.gender,
        disability: user.user_metadata?.disability,
        course: user.user_metadata?.course,
        religion: user.user_metadata?.religion,
        area: user.user_metadata?.area,
        useSemanticMatching: semanticEnabled,
      };

      const response = await getRecommendations(profileData);
      setRecommendations(response.recommendations);
      setSemanticSuggestions(response.semanticSuggestions || []);
      setTotalMatches(response.totalMatches);
      setMatchingStrategy(response.matchingStrategy);
      setHasFetched(true);
    } catch (err) {
      setError(
        t(
          'Failed to load recommendations. Please try again.',
          'सिफारिशें लोड करने में विफल। कृपया पुनः प्रयास करें।',
          'பரிந்துரைகளை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
          'సిఫారసులను లోడ్ చేయడంలో విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // Toggle semantic matching and refetch
  const handleSemanticToggle = () => {
    const newValue = !useSemanticMatching;
    setUseSemanticMatching(newValue);
    fetchRecommendations(newValue);
  };

  // Handle save/unsave
  const handleSave = async (scholarship: ScholarshipResult & { type?: 'public' | 'private' }) => {
    if (!user) return;
    try {
      await saveScholarship({
        id: scholarship.id,
        name: scholarship.name,
        description: scholarship.description,
        benefits: scholarship.benefits,
        deadline: scholarship.deadline,
        officialUrl: scholarship.officialUrl,
        type: scholarship.type || 'public'
      }, user.id, 'student');
      setSavedIds(prev => new Set([...prev, scholarship.id]));
    } catch (err) {
      console.error('Failed to save scholarship:', err);
    }
  };

  const handleUnsave = async (id: string) => {
    if (!user) return;
    try {
      await unsaveScholarship(id, user.id, 'student');
      setSavedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      console.error('Failed to unsave scholarship:', err);
    }
  };

  useEffect(() => {
    if (user && profileComplete) {
      fetchRecommendations();
    }
  }, [user, profileComplete]);

  // Build compact profile summary
  const profileSummary = useMemo(() => {
    const parts: string[] = [];
    if (profile?.state) parts.push(profile.state);
    if (profile?.category) parts.push(profile.category.toUpperCase());
    if (profile?.gender) parts.push(profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1));
    if (profile?.income) {
      const incomeNum = parseInt(profile.income);
      if (incomeNum) parts.push(formatBenefitAmount(incomeNum));
    }
    return parts.join(' • ') || t('Complete your profile', 'अपनी प्रोफ़ाइल पूर्ण करें', 'சுயவிவரத்தை நிறைவு செய்', 'ప్రొఫైల్ పూర్తి చేయండి');
  }, [profile, t]);

  // Incomplete profile state
  if (!profileComplete) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card padding="lg" className="text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            {t(
              'Complete Your Profile',
              'अपनी प्रोफ़ाइल पूर्ण करें',
              'உங்கள் சுயவிவரத்தை நிறைவு செய்யுங்கள்',
              'మీ ప్రొఫైల్‌ను పూర్తి చేయండి'
            )}
          </h2>
          <p className="text-text-secondary mb-6">
            {t(
              'To get personalized scholarship recommendations, please complete your profile first.',
              'व्यक्तिगत छात्रवृत्ति सिफारिशें प्राप्त करने के लिए, कृपया पहले अपनी प्रोफ़ाइल पूर्ण करें।',
              'தனிப்பயனாக்கப்பட்ட உதவித்தொகை பரிந்துரைகளைப் பெற, முதலில் உங்கள் சுயவிவரத்தை நிறைவு செய்யவும்.',
              'వ్యక్తిగత స్కాలర్‌షిప్ సిఫారసులను పొందడానికి, దయచేసి మొదట మీ ప్రొఫైల్‌ను పూర్తి చేయండి.'
            )}
          </p>
          <Button variant="primary" onClick={() => window.location.href = '/student/profile'}>
            {t('Go to Profile', 'प्रोफ़ाइल पर जाएं', 'சுயவிவரத்திற்கு செல்க', 'ప్రొఫైల్‌కు వెళ్ళండి')}
          </Button>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading && !hasFetched) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-text-secondary">
          {t(
            'Finding scholarships for you...',
            'आपके लिए छात्रवृत्ति खोज रहे हैं...',
            'உங்களுக்கான உதவித்தொகைகளைக் கண்டறிகிறது...',
            'మీ కోసం స్కాలర్‌షిప్‌లను కనుగొంటోంది...'
          )}
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card padding="lg" className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            {t('Something went wrong', 'कुछ गलत हो गया', 'ஏதோ தவறு ஏற்பட்டது', 'ఏదో తప్పు జరిగింది')}
          </h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <Button variant="primary" onClick={() => fetchRecommendations()} isLoading={loading}>
            {t('Try Again', 'पुनः प्रयास करें', 'மீண்டும் முயற்சிக்கவும்', 'మళ్ళీ ప్రయత్నించండి')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Edit Profile Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {t(
              'Find Scholarships',
              'छात्रवृत्ति खोजें',
              'உதவித்தொகைகளைக் கண்டறியவும்',
              'స్కాలర్‌షిప్‌లను కనుగొనండి'
            )}
          </h1>
        </div>
        <Button
          variant="secondary"
          onClick={() => setIsPanelOpen(true)}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          {t('Edit Profile', 'प्रोफ़ाइल संपादित करें', 'சுயவிவரத்தைத் திருத்து', 'ప్రొఫైల్ సవరించు')}
        </Button>
      </div>

      {/* Compact Profile Summary Bar */}
      <div className="bg-gray-50 rounded-lg px-4 py-2.5 flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="text-sm text-gray-700 font-medium">{profileSummary}</span>
      </div>

      {/* AI Matching Toggle */}
      <Card padding="md" className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-purple-900">
                {t(
                  'AI-Powered Semantic Matching',
                  'AI-संचालित सिमेंटिक मैचिंग',
                  'AI-இயக்கப்படும் சொற்பொருள் பொருத்தம்',
                  'AI-ఆధారిత సెమాంటిక్ మ్యాచింగ్'
                )}
              </h3>
              <p className="text-xs text-purple-700 mt-0.5">
                {t(
                  'Uses embeddings to find scholarships that match your profile semantically',
                  'आपकी प्रोफ़ाइल से अर्थपूर्ण रूप से मेल खाने वाली छात्रवृत्तियों को खोजने के लिए एम्बेडिंग का उपयोग करता है',
                  'உங்கள் சுயவிவரத்துடன் சொற்பொருள் ரீதியாக பொருந்தும் உதவித்தொகைகளைக் கண்டறிய எம்பெடிங்குகளைப் பயன்படுத்துகிறது',
                  'మీ ప్రొఫైల్‌తో అర్థపరంగా సరిపోలే స్కాలర్‌షిప్‌లను కనుగొనడానికి ఎంబెడ్డింగ్‌లను ఉపయోగిస్తుంది'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleSemanticToggle}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 ${
              useSemanticMatching ? 'bg-purple-600' : 'bg-gray-200'
            }`}
            role="switch"
            aria-checked={useSemanticMatching}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                useSemanticMatching ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        {matchingStrategy === 'hybrid' && (
          <div className="mt-2 flex items-center gap-2 text-xs text-purple-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t(
              'Hybrid matching active (70% eligibility + 30% semantic)',
              'हाइब्रिड मैचिंग सक्रिय (70% पात्रता + 30% सिमेंटिक)',
              'கலப்பு பொருத்தம் செயலில் (70% தகுதி + 30% சொற்பொருள்)',
              'హైబ్రిడ్ మ్యాచింగ్ యాక్టివ్ (70% అర్హత + 30% సెమాంటిక్)'
            )}
          </div>
        )}
      </Card>

      {/* Stats Banner + Sort Dropdown */}
      {totalMatches > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Stats Banner */}
          <div className="bg-gray-800 p-4 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{stats.total}</span>
                  <span className="text-gray-300 text-sm">
                    {t('matches', 'मैच', 'பொருத்தங்கள்', 'మ్యాచ్‌లు')}
                  </span>
                </div>
                {stats.urgent > 0 && (
                  <div className="flex items-center gap-1.5 bg-red-500/30 px-2.5 py-1 rounded-full">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">
                      {stats.urgent} {t('urgent', 'अर्जेंट', 'அவசரம்', 'అత్యవసర')}
                    </span>
                  </div>
                )}
                {stats.potential > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-300 text-sm">{t('Up to', 'तक', 'வரை', 'వరకు')}</span>
                    <span className="text-lg font-bold">{formatBenefitAmount(stats.potential)}</span>
                    <span className="text-gray-300 text-sm">{t('potential', 'संभावित', 'சாத்தியம்', 'సంభావ్య')}</span>
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-gray-300 text-sm">{t('Sort by:', 'क्रमबद्ध:', 'வரிசைப்படுத்து:', 'క్రమం:')}</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-white/20 text-white border-0 rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-white/50 focus:outline-none cursor-pointer"
                >
                  <option value="match" className="text-gray-900">
                    {t('Match Score', 'मैच स्कोर', 'பொருத்த மதிப்பெண்', 'మ్యాచ్ స్కోర్')}
                  </option>
                  <option value="deadline" className="text-gray-900">
                    {t('Deadline (Soonest)', 'समय सीमा (जल्द)', 'காலக்கெடு (விரைவில்)', 'గడువు (త్వరలో)')}
                  </option>
                  <option value="benefit" className="text-gray-900">
                    {t('Benefit (Highest)', 'लाभ (उच्चतम)', 'பலன் (அதிகபட்சம்)', 'ప్రయోజనం (అధిక)')}
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Tab Buttons */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeFilter === 'all'
                  ? 'text-gray-900 bg-gray-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {t('All', 'सभी', 'அனைத்தும்', 'అన్నీ')}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeFilter === 'all' ? 'bg-gray-300 text-gray-800' : 'bg-gray-200 text-gray-600'
                }`}>
                  {counts.all}
                </span>
              </span>
              {activeFilter === 'all' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800" />
              )}
            </button>

            <button
              onClick={() => setActiveFilter('government')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeFilter === 'government'
                  ? 'text-gray-900 bg-gray-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {t('Government', 'सरकारी', 'அரசு', 'ప్రభుత్వ')}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeFilter === 'government' ? 'bg-gray-300 text-gray-800' : 'bg-gray-200 text-gray-600'
                }`}>
                  {counts.government}
                </span>
              </span>
              {activeFilter === 'government' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800" />
              )}
            </button>

            <button
              onClick={() => setActiveFilter('private')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeFilter === 'private'
                  ? 'text-gray-900 bg-gray-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {t('Private', 'प्राइवेट', 'தனியார்', 'ప్రైవేట్')}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeFilter === 'private' ? 'bg-gray-300 text-gray-800' : 'bg-gray-200 text-gray-600'
                }`}>
                  {counts.private}
                </span>
              </span>
              {activeFilter === 'private' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {filteredRecommendations.length > 0 ? (
        <div className="space-y-3">
          {filteredRecommendations.map((scholarship) => (
            <ScholarshipCard
              key={scholarship.id}
              scholarship={scholarship}
              t={t}
              matchScore={scholarship.matchScore}
              matchReasons={scholarship.matchReasons}
              showSemanticScore={useSemanticMatching}
              eligibilityScore={scholarship.eligibilityScore}
              semanticScore={scholarship.semanticScore}
              isSaved={savedIds.has(scholarship.id)}
              onSave={handleSave}
              onUnsave={handleUnsave}
            />
          ))}
        </div>
      ) : activeFilter !== 'all' && recommendations.length > 0 ? (
        // Show message when filter has no results but other scholarships exist
        <Card padding="lg" className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            {activeFilter === 'government'
              ? t('No Government Scholarships', 'कोई सरकारी छात्रवृत्ति नहीं', 'அரசு உதவித்தொகைகள் இல்லை', 'ప్రభుత్వ స్కాలర్‌షిప్‌లు లేవు')
              : t('No Private Scholarships', 'कोई प्राइवेट छात्रवृत्ति नहीं', 'தனியார் உதவித்தொகைகள் இல்லை', 'ప్రైవేట్ స్కాలర్‌షిప్‌లు లేవు')
            }
          </h2>
          <p className="text-text-secondary mb-4">
            {t(
              'No scholarships found in this category for your profile.',
              'आपकी प्रोफ़ाइल के लिए इस श्रेणी में कोई छात्रवृत्ति नहीं मिली।',
              'உங்கள் சுயவிவரத்திற்கு இந்த வகையில் உதவித்தொகைகள் இல்லை.',
              'మీ ప్రొఫైల్ కోసం ఈ వర్గంలో స్కాలర్‌షిప్‌లు లేవు.'
            )}
          </p>
          <Button variant="secondary" onClick={() => setActiveFilter('all')}>
            {t('View All Scholarships', 'सभी छात्रवृत्तियां देखें', 'அனைத்து உதவித்தொகைகளையும் காண்க', 'అన్ని స్కాలర్‌షిప్‌లు చూడండి')}
          </Button>
        </Card>
      ) : (
        hasFetched && (
          <Card padding="lg" className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              {t(
                'No Matches Found',
                'कोई मिलान नहीं मिला',
                'பொருத்தங்கள் எதுவும் கிடைக்கவில்லை',
                'సరిపోలికలు కనుగొనబడలేదు'
              )}
            </h2>
            <p className="text-text-secondary mb-4">
              {t(
                'Try updating your profile or use the chat assistant for a broader search.',
                'अपनी प्रोफ़ाइल अपडेट करें या व्यापक खोज के लिए चैट सहायक का उपयोग करें।',
                'உங்கள் சுயவிவரத்தைப் புதுப்பிக்கவும் அல்லது பரந்த தேடலுக்கு அரட்டை உதவியாளரைப் பயன்படுத்தவும்.',
                'మీ ప్రొఫైల్‌ను నవీకరించండి లేదా విస్తృత శోధన కోసం చాట్ అసిస్టెంట్‌ను ఉపయోగించండి.'
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="secondary"
                onClick={() => setIsPanelOpen(true)}
              >
                {t('Update Profile', 'प्रोफ़ाइल अपडेट करें', 'சுயவிவரத்தைப் புதுப்பிக்கவும்', 'ప్రొఫైల్ నవీకరించండి')}
              </Button>
              <Button
                variant="primary"
                onClick={() => window.location.href = '/student/chat'}
              >
                {t('Chat Assistant', 'चैट सहायक', 'அரட்டை உதவியாளர்', 'చాట్ అసిస్టెంట్')}
              </Button>
            </div>
          </Card>
        )
      )}

      {/* Semantic Suggestions - "You Might Also Like" */}
      {semanticSuggestions.length > 0 && (
        <div className="space-y-4 mt-8">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {t(
                  'You Might Also Like',
                  'आपको यह भी पसंद आ सकता है',
                  'உங்களுக்கு இதுவும் பிடிக்கும்',
                  'మీకు ఇది కూడా నచ్చవచ్చు'
                )}
              </h2>
              <p className="text-sm text-text-secondary">
                {t(
                  'AI-discovered scholarships based on your profile (check eligibility)',
                  'आपकी प्रोफ़ाइल के आधार पर AI द्वारा खोजी गई छात्रवृत्तियां (पात्रता जांचें)',
                  'உங்கள் சுயவிவரத்தின் அடிப்படையில் AI கண்டறிந்த உதவித்தொகைகள் (தகுதியை சரிபார்க்கவும்)',
                  'మీ ప్రొఫైల్ ఆధారంగా AI కనుగొన్న స్కాలర్‌షిప్‌లు (అర్హతను తనిఖీ చేయండి)'
                )}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {semanticSuggestions.map((scholarship) => (
              <div key={scholarship.id} className="relative">
                {/* Eligibility warnings banner */}
                {scholarship.eligibilityWarnings && scholarship.eligibilityWarnings.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-t-lg px-4 py-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-xs text-amber-800">
                      {t('Check eligibility:', 'पात्रता जांचें:', 'தகுதியை சரிபார்க்கவும்:', 'అర్హతను తనిఖీ చేయండి:')}{' '}
                      {scholarship.eligibilityWarnings.join(' | ')}
                    </span>
                  </div>
                )}
                <ScholarshipCard
                  scholarship={scholarship}
                  t={t}
                  matchScore={scholarship.matchScore}
                  matchReasons={scholarship.matchReasons}
                  showSemanticScore={true}
                  semanticScore={scholarship.semanticScore}
                  isSemanticSuggestion={true}
                  isSaved={savedIds.has(scholarship.id)}
                  onSave={handleSave}
                  onUnsave={handleUnsave}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile Slide Panel */}
      <ProfileSlidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onSaveSuccess={() => fetchRecommendations()}
      />
    </div>
  );
}
