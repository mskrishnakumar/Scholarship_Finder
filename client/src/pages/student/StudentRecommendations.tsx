import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import ScholarshipCard from '../../components/ScholarshipCard';
import { getRecommendations } from '../../services/apiClient';
import type { RecommendedScholarship } from '../../services/apiClient';

type ScholarshipFilter = 'all' | 'government' | 'private';

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
  const [isProfileCollapsed, setIsProfileCollapsed] = useState(false);

  // Filter scholarships by type
  const filteredRecommendations = useMemo(() => {
    if (activeFilter === 'all') return recommendations;
    const filterType = activeFilter === 'government' ? 'public' : 'private';
    return recommendations.filter(s => s.type === filterType);
  }, [recommendations, activeFilter]);

  // Count scholarships by type
  const counts = useMemo(() => ({
    all: recommendations.length,
    government: recommendations.filter(s => s.type === 'public').length,
    private: recommendations.filter(s => s.type === 'private').length,
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

  useEffect(() => {
    if (user && profileComplete) {
      fetchRecommendations();
    }
  }, [user, profileComplete]);

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
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4" />
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {t(
              'Your Recommendations',
              'आपकी सिफारिशें',
              'உங்கள் பரிந்துரைகள்',
              'మీ సిఫారసులు'
            )}
          </h1>
        </div>
        <Button
          variant="secondary"
          onClick={() => fetchRecommendations()}
          isLoading={loading}
        >
          {t('Refresh', 'रिफ्रेश', 'புதுப்பி', 'రిఫ్రెష్')}
        </Button>
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

      {/* Tabbed Navigation for Government/Private */}
      {totalMatches > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Results Summary Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold">
                  {t(
                    `Found ${totalMatches} Scholarship${totalMatches !== 1 ? 's' : ''}!`,
                    `${totalMatches} छात्रवृत्ति${totalMatches !== 1 ? 'यां' : ''} मिलीं!`,
                    `${totalMatches} உதவித்தொகை${totalMatches !== 1 ? 'கள்' : ''} கிடைத்தன!`,
                    `${totalMatches} స్కాలర్‌షిప్${totalMatches !== 1 ? 'లు' : ''} దొరికాయి!`
                  )}
                </p>
                <p className="text-teal-100 text-sm">
                  {t(
                    'Based on your profile details',
                    'आपकी प्रोफ़ाइल के आधार पर',
                    'உங்கள் சுயவிவரத்தின் அடிப்படையில்',
                    'మీ ప్రొఫైల్ వివరాల ఆధారంగా'
                  )}
                  {matchingStrategy === 'hybrid' && (
                    <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-xs">
                      + AI
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Tab Buttons */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeFilter === 'all'
                  ? 'text-teal-700 bg-teal-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                {t('All', 'सभी', 'அனைத்தும்', 'అన్నీ')}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeFilter === 'all' ? 'bg-teal-200 text-teal-800' : 'bg-gray-200 text-gray-700'
                }`}>
                  {counts.all}
                </span>
              </span>
              {activeFilter === 'all' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />
              )}
            </button>

            <button
              onClick={() => setActiveFilter('government')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeFilter === 'government'
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {t('Government', 'सरकारी', 'அரசு', 'ప్రభుత్వ')}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeFilter === 'government' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'
                }`}>
                  {counts.government}
                </span>
              </span>
              {activeFilter === 'government' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>

            <button
              onClick={() => setActiveFilter('private')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeFilter === 'private'
                  ? 'text-amber-700 bg-amber-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t('Private', 'प्राइवेट', 'தனியார்', 'ప్రైవేట్')}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeFilter === 'private' ? 'bg-amber-200 text-amber-800' : 'bg-gray-200 text-gray-700'
                }`}>
                  {counts.private}
                </span>
              </span>
              {activeFilter === 'private' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {filteredRecommendations.length > 0 ? (
        <div className="space-y-4">
          {filteredRecommendations.map((scholarship, index) => (
            <ScholarshipCard
              key={scholarship.id}
              scholarship={scholarship}
              t={t}
              matchScore={scholarship.matchScore}
              matchReasons={scholarship.matchReasons}
              index={index + 1}
              showSemanticScore={useSemanticMatching}
              eligibilityScore={scholarship.eligibilityScore}
              semanticScore={scholarship.semanticScore}
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
                onClick={() => window.location.href = '/student/profile'}
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
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collapsible Profile Summary Card */}
      <Card padding="none" className="bg-gray-50 overflow-hidden">
        <button
          onClick={() => setIsProfileCollapsed(!isProfileCollapsed)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-teal-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-text-primary">
              {t(
                'Your Profile Summary',
                'आपकी प्रोफ़ाइल सारांश',
                'உங்கள் சுயவிவர சுருக்கம்',
                'మీ ప్రొఫైల్ సారాంశం'
              )}
            </span>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
              isProfileCollapsed ? '' : 'rotate-180'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>

        {/* Collapsible Content */}
        <div
          className={`transition-all duration-200 ease-in-out overflow-hidden ${
            isProfileCollapsed ? 'max-h-0' : 'max-h-48'
          }`}
        >
          <div className="px-4 pb-4 pt-1 border-t border-gray-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              {profile?.state && (
                <div className="text-center p-2 bg-white rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500">{t('State', 'राज्य', 'மாநிலம்', 'రాష్ట్రం')}</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{profile.state}</p>
                </div>
              )}
              {profile?.category && (
                <div className="text-center p-2 bg-white rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500">{t('Category', 'श्रेणी', 'வகை', 'వర్గం')}</p>
                  <p className="text-sm font-medium text-gray-900">{profile.category.toUpperCase()}</p>
                </div>
              )}
              {profile?.educationLevel && (
                <div className="text-center p-2 bg-white rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500">{t('Education', 'शिक्षा', 'கல்வி', 'విద్య')}</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{profile.educationLevel}</p>
                </div>
              )}
              {profile?.course && (
                <div className="text-center p-2 bg-white rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500">{t('Course', 'कोर्स', 'படிப்பு', 'కోర్సు')}</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{profile.course}</p>
                </div>
              )}
              {profile?.gender && (
                <div className="text-center p-2 bg-white rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500">{t('Gender', 'लिंग', 'பாலினம்', 'లింగం')}</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{profile.gender}</p>
                </div>
              )}
              {profile?.income && (
                <div className="text-center p-2 bg-white rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500">{t('Income', 'आय', 'வருமானம்', 'ఆదాయం')}</p>
                  <p className="text-sm font-medium text-gray-900">₹{Number(profile.income).toLocaleString()}</p>
                </div>
              )}
              {profile?.area && (
                <div className="text-center p-2 bg-white rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500">{t('Area', 'क्षेत्र', 'பகுதி', 'ప్రాంతం')}</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{profile.area}</p>
                </div>
              )}
              {profile?.religion && (
                <div className="text-center p-2 bg-white rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500">{t('Religion', 'धर्म', 'மதம்', 'మతం')}</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{profile.religion}</p>
                </div>
              )}
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = '/student/profile';
                }}
              >
                {t('Edit Profile', 'प्रोफ़ाइल संपादित करें', 'சுயவிவரத்தைத் திருத்து', 'ప్రొఫైల్ సవరించు')}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
