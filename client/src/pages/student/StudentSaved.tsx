import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

interface SavedScholarship {
  id: string;
  name: string;
  description: string;
  benefits: string;
  deadline: string;
  officialUrl?: string;
  savedAt: string;
}

export default function StudentSaved() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [savedScholarships, setSavedScholarships] = useState<SavedScholarship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load saved scholarships from localStorage for now
    // In production, this would be an API call
    const loadSaved = () => {
      try {
        const saved = localStorage.getItem(`saved_scholarships_${user?.id}`);
        if (saved) {
          setSavedScholarships(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Failed to load saved scholarships:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSaved();
  }, [user?.id]);

  const handleRemove = (id: string) => {
    const updated = savedScholarships.filter(s => s.id !== id);
    setSavedScholarships(updated);
    localStorage.setItem(`saved_scholarships_${user?.id}`, JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
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
          {t(
            'Scholarships you have saved for later review.',
            'बाद में समीक्षा के लिए आपने जो छात्रवृत्तियां सहेजी हैं।',
            'பின்னர் மதிப்பாய்வு செய்ய நீங்கள் சேமித்த உதவித்தொகைகள்.',
            'తర్వాత సమీక్షించడానికి మీరు సేవ్ చేసిన స్కాలర్‌షిప్‌లు.'
          )}
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
                'Start searching for scholarships and save them here for easy access.',
                'छात्रवृत्तियों की खोज शुरू करें और आसान पहुंच के लिए उन्हें यहां सहेजें।',
                'உதவித்தொகைகளைத் தேடத் தொடங்கி, எளிதான அணுகலுக்கு இங்கே சேமிக்கவும்.',
                'స్కాలర్‌షిప్‌ల కోసం శోధించడం ప్రారంభించండి మరియు సులభంగా యాక్సెస్ కోసం ఇక్కడ సేవ్ చేయండి.'
              )}
            </p>
            <Link to="/student/search">
              <Button variant="primary">
                {t('Find Scholarships', 'छात्रवृत्ति खोजें', 'உதவித்தொகைகளைக் கண்டறியவும்', 'స్కాలర్‌షిప్‌లను కనుగొనండి')}
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {savedScholarships.map((scholarship) => (
            <Card key={scholarship.id} padding="none" className="overflow-hidden">
              <div className="border-l-4 border-teal-600 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-teal-800">{scholarship.name}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{scholarship.description}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {scholarship.benefits}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        {t('Deadline:', 'अंतिम तिथि:', 'காலக்கெடு:', 'గడువు:')} {scholarship.deadline}
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
                        className="inline-flex items-center justify-center gap-1 px-4 py-2 bg-teal-700 text-white text-sm font-medium rounded-lg hover:bg-teal-800 transition-colors"
                      >
                        {t('Apply', 'आवेदन करें', 'விண்ணப்பிக்க', 'దరఖాస్తు చేయండి')}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                    <button
                      onClick={() => handleRemove(scholarship.id)}
                      className="inline-flex items-center justify-center gap-1 px-4 py-2 text-gray-500 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {t('Remove', 'हटाएं', 'அகற்று', 'తొలగించు')}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
