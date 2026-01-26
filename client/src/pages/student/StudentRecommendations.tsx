import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import ScholarshipCard from '../../components/ScholarshipCard';
import { getRecommendations } from '../../services/apiClient';
import type { RecommendedScholarship } from '../../services/apiClient';

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

      {/* Prominent Results Count Banner */}
      {totalMatches > 0 && (
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold">
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
      )}

      {/* Results */}
      {recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.map((scholarship, index) => (
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

      {/* Profile Summary Card */}
      <Card padding="md" className="bg-gray-50">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-teal-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-text-primary">
              {t(
                'Recommendations based on your profile',
                'आपकी प्रोफ़ाइल के आधार पर सिफारिशें',
                'உங்கள் சுயவிவரத்தின் அடிப்படையில் பரிந்துரைகள்',
                'మీ ప్రొఫైల్ ఆధారంగా సిఫారసులు'
              )}
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              {[
                profile?.state,
                profile?.category?.toUpperCase(),
                profile?.educationLevel,
                profile?.course,
              ]
                .filter(Boolean)
                .join(' | ') ||
                t(
                  'Complete your profile for better matches',
                  'बेहतर मिलान के लिए अपनी प्रोफ़ाइल पूर्ण करें',
                  'சிறந்த பொருத்தங்களுக்கு உங்கள் சுயவிவரத்தை நிறைவு செய்யுங்கள்',
                  'మెరుగైన సరిపోలికల కోసం మీ ప్రొఫైల్‌ను పూర్తి చేయండి'
                )}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
