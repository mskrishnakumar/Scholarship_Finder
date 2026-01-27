import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { getSavedScholarships, unsaveScholarship } from '../../services/apiClient';
import type { SavedScholarship } from '../../services/apiClient';
import {
  formatDeadlineDisplay,
  getDeadlineBadgeClasses,
  getDaysUntilDeadline
} from '../../utils/deadlineUtils';

export default function StudentSaved() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [savedScholarships, setSavedScholarships] = useState<SavedScholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    const loadSaved = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { scholarships } = await getSavedScholarships(user.id, 'student');
        setSavedScholarships(scholarships);
        setError(null);
      } catch (err) {
        console.error('Failed to load saved scholarships:', err);
        setError(
          t(
            'Failed to load saved scholarships. Please try again.',
            'सहेजी गई छात्रवृत्तियां लोड करने में विफल। कृपया पुनः प्रयास करें।',
            'சேமிக்கப்பட்ட உதவித்தொகைகளை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
            'సేవ్ చేసిన స్కాలర్‌షిప్‌లను లోడ్ చేయడంలో విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.'
          )
        );
      } finally {
        setLoading(false);
      }
    };
    loadSaved();
  }, [user, t]);

  const handleRemove = async (id: string) => {
    if (!user || removingId) return;

    setRemovingId(id);
    try {
      await unsaveScholarship(id, user.id, 'student');
      setSavedScholarships(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to remove scholarship:', err);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card padding="lg" className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {t('Error Loading Saved Scholarships', 'सहेजी गई छात्रवृत्तियां लोड करने में त्रुटि', 'சேமிக்கப்பட்ட உதவித்தொகைகளை ஏற்றுவதில் பிழை', 'సేవ్ చేసిన స్కాలర్‌షిప్‌లను లోడ్ చేయడంలో లోపం')}
          </h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            {t('Retry', 'पुनः प्रयास करें', 'மீண்டும் முயற்சிக்கவும்', 'మళ్ళీ ప్రయత్నించండి')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          {t('Saved Scholarships', 'सहेजी गई छात्रवृत्तियां', 'சேமிக்கப்பட்ட உதவித்தொகைகள்', 'సేవ్ చేసిన స్కాలర్‌షిప్‌లు')}
        </h1>
        <p className="mt-1 text-text-secondary">
          {savedScholarships.length > 0
            ? t(
                `You have ${savedScholarships.length} saved scholarship${savedScholarships.length !== 1 ? 's' : ''}.`,
                `आपने ${savedScholarships.length} छात्रवृत्ति${savedScholarships.length !== 1 ? 'यां' : ''} सहेजी हैं।`,
                `நீங்கள் ${savedScholarships.length} உதவித்தொகை${savedScholarships.length !== 1 ? 'கள்' : ''} சேமித்துள்ளீர்கள்.`,
                `మీరు ${savedScholarships.length} స్కాలర్‌షిప్${savedScholarships.length !== 1 ? 'లు' : ''} సేవ్ చేసారు.`
              )
            : t(
                'Scholarships you save will appear here for later review.',
                'आपके द्वारा सहेजी गई छात्रवृत्तियां बाद में समीक्षा के लिए यहां दिखाई देंगी।',
                'நீங்கள் சேமிக்கும் உதவித்தொகைகள் பின்னர் மதிப்பாய்வுக்காக இங்கே தோன்றும்.',
                'మీరు సేవ్ చేసే స్కాలర్‌షిప్‌లు తర్వాత సమీక్ష కోసం ఇక్కడ కనిపిస్తాయి.'
              )
          }
        </p>
      </div>

      {savedScholarships.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {t('No saved scholarships yet', 'अभी तक कोई सहेजी गई छात्रवृत्ति नहीं', 'இன்னும் சேமிக்கப்பட்ட உதவித்தொகைகள் இல்லை', 'ఇంకా సేవ్ చేసిన స్కాలర్‌షిప్‌లు లేవు')}
            </h3>
            <p className="text-gray-500 mb-6">
              {t(
                'Find scholarships and save them for quick access later.',
                'छात्रवृत्तियां खोजें और बाद में त्वरित पहुंच के लिए उन्हें सहेजें।',
                'உதவித்தொகைகளைக் கண்டறிந்து பின்னர் விரைவான அணுகலுக்காக அவற்றைச் சேமிக்கவும்.',
                'స్కాలర్‌షిప్‌లను కనుగొని తర్వాత త్వరిత యాక్సెస్ కోసం వాటిని సేవ్ చేయండి.'
              )}
            </p>
            <Link to="/student/recommendations">
              <Button variant="primary">
                {t('Find Scholarships', 'छात्रवृत्ति खोजें', 'உதவித்தொகைகளைக் கண்டறியவும்', 'స్కాలర్‌షిప్‌లను కనుగొనండి')}
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {savedScholarships.map((scholarship) => {
            const deadlineDisplay = formatDeadlineDisplay(scholarship.deadline, t);
            const deadlineBadgeClasses = getDeadlineBadgeClasses(scholarship.deadline);
            const daysLeft = getDaysUntilDeadline(scholarship.deadline);
            const isGovernment = scholarship.type === 'public';
            const typeBadge = isGovernment
              ? { bg: 'bg-blue-100', text: 'text-blue-700', label: t('Govt', 'सरकारी', 'அரசு', 'ప్రభుత్వ') }
              : { bg: 'bg-amber-100', text: 'text-amber-700', label: t('Private', 'प्राइवेट', 'தனியார்', 'ప్రైవేట్') };

            return (
              <Card key={scholarship.id} padding="none" className="overflow-hidden">
                <div className="border-l-4 border-teal-600 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Header with type badge and name */}
                      <div className="flex items-start gap-2 mb-2">
                        <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${typeBadge.bg} ${typeBadge.text}`}>
                          {typeBadge.label}
                        </span>
                        <h3 className="font-semibold text-gray-900">{scholarship.name}</h3>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2">{scholarship.description}</p>

                      {/* Metrics row */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          {scholarship.benefits}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${deadlineBadgeClasses}`}>
                          {daysLeft >= 0 && daysLeft <= 7 && (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                          )}
                          {deadlineDisplay}
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 mt-3">
                        {t('Saved on', 'सहेजा गया', 'சேமிக்கப்பட்டது', 'సేవ్ చేసిన తేదీ')} {new Date(scholarship.savedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      {scholarship.officialUrl && (
                        <a
                          href={scholarship.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-teal-700 text-white text-sm font-medium rounded-lg hover:bg-teal-800 transition-colors"
                        >
                          {t('Apply', 'आवेदन करें', 'விண்ணப்பிக்க', 'దరఖాస్తు చేయండి')}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                      <button
                        onClick={() => handleRemove(scholarship.id)}
                        disabled={removingId === scholarship.id}
                        className="inline-flex items-center justify-center gap-1 px-4 py-2 text-gray-500 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                      >
                        {removingId === scholarship.id ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                        {t('Remove', 'हटाएं', 'அகற்று', 'తొలగించు')}
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
