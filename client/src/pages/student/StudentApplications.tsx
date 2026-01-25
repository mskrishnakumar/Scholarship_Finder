import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

type ApplicationStatus = 'applied' | 'in_review' | 'accepted' | 'rejected';

interface ScholarshipApplication {
  id: string;
  scholarshipId: string;
  name: string;
  description: string;
  benefits: string;
  appliedAt: string;
  status: ApplicationStatus;
  officialUrl?: string;
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'error' }> = {
  applied: { label: 'Applied', variant: 'default' },
  in_review: { label: 'In Review', variant: 'warning' },
  accepted: { label: 'Accepted', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'error' },
};

export default function StudentApplications() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');

  useEffect(() => {
    // Load applications from localStorage for now
    // In production, this would be an API call
    const loadApplications = () => {
      try {
        const saved = localStorage.getItem(`scholarship_applications_${user?.id}`);
        if (saved) {
          setApplications(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Failed to load applications:', error);
      } finally {
        setLoading(false);
      }
    };
    loadApplications();
  }, [user?.id]);

  const filteredApplications = filter === 'all'
    ? applications
    : applications.filter(app => app.status === filter);

  const getStatusLabel = (status: ApplicationStatus): string => {
    const config = STATUS_CONFIG[status];
    switch (status) {
      case 'applied':
        return t('Applied', 'आवेदित', 'விண்ணப்பிக்கப்பட்டது', 'దరఖాస్తు చేయబడింది');
      case 'in_review':
        return t('In Review', 'समीक्षाधीन', 'மதிப்பாய்வில்', 'సమీక్షలో');
      case 'accepted':
        return t('Accepted', 'स्वीकृत', 'ஏற்றுக்கொள்ளப்பட்டது', 'ఆమోదించబడింది');
      case 'rejected':
        return t('Rejected', 'अस्वीकृत', 'நிராகரிக்கப்பட்டது', 'తిరస్కరించబడింది');
      default:
        return config.label;
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {t('My Applications', 'मेरे आवेदन', 'எனது விண்ணப்பங்கள்', 'నా అప్లికేషన్లు')}
          </h1>
          <p className="mt-1 text-text-secondary">
            {t(
              'Track the status of your scholarship applications.',
              'अपने छात्रवृत्ति आवेदनों की स्थिति ट्रैक करें।',
              'உங்கள் உதவித்தொகை விண்ணப்பங்களின் நிலையைக் கண்காணிக்கவும்.',
              'మీ స్కాలర్‌షిప్ అప్లికేషన్ల స్థితిని ట్రాక్ చేయండి.'
            )}
          </p>
        </div>

        {applications.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filter === 'all' ? 'bg-teal-100 text-teal-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t('All', 'सभी', 'அனைத்தும்', 'అన్నీ')} ({applications.length})
            </button>
            <button
              onClick={() => setFilter('applied')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filter === 'applied' ? 'bg-teal-100 text-teal-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t('Applied', 'आवेदित', 'விண்ணப்பிக்கப்பட்டது', 'దరఖాస్తు చేయబడింది')}
            </button>
            <button
              onClick={() => setFilter('in_review')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filter === 'in_review' ? 'bg-amber-100 text-amber-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t('In Review', 'समीक्षाधीन', 'மதிப்பாய்வில்', 'సమీక్షలో')}
            </button>
            <button
              onClick={() => setFilter('accepted')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filter === 'accepted' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t('Accepted', 'स्वीकृत', 'ஏற்றுக்கொள்ளப்பட்டது', 'ఆమోదించబడింది')}
            </button>
          </div>
        )}
      </div>

      {applications.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {t('No applications yet', 'अभी तक कोई आवेदन नहीं', 'இன்னும் விண்ணப்பங்கள் இல்லை', 'ఇంకా అప్లికేషన్లు లేవు')}
            </h3>
            <p className="text-gray-500 mb-6">
              {t(
                'Find scholarships and start applying to track your applications here.',
                'छात्रवृत्तियां खोजें और अपने आवेदनों को यहां ट्रैक करने के लिए आवेदन करना शुरू करें।',
                'உதவித்தொகைகளைக் கண்டறிந்து, உங்கள் விண்ணப்பங்களை இங்கே கண்காணிக்க விண்ணப்பிக்கத் தொடங்குங்கள்.',
                'స్కాలర్‌షిప్‌లను కనుగొని, మీ అప్లికేషన్‌లను ఇక్కడ ట్రాక్ చేయడానికి దరఖాస్తు చేయడం ప్రారంభించండి.'
              )}
            </p>
            <Link to="/student/search">
              <Button variant="primary">
                {t('Find Scholarships', 'छात्रवृत्ति खोजें', 'உதவித்தொகைகளைக் கண்டறியவும்', 'స్కాలర్‌షిప్‌లను కనుగొనండి')}
              </Button>
            </Link>
          </div>
        </Card>
      ) : filteredApplications.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-8">
            <p className="text-gray-500">
              {t(
                'No applications match the selected filter.',
                'चयनित फ़िल्टर से कोई आवेदन मेल नहीं खाता।',
                'தேர்ந்தெடுக்கப்பட்ட வடிப்பானுடன் எந்த விண்ணப்பமும் பொருந்தவில்லை.',
                'ఎంచుకున్న ఫిల్టర్‌తో ఏ అప్లికేషన్‌లు సరిపోలలేదు.'
              )}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card key={application.id} padding="none" className="overflow-hidden">
              <div className={`border-l-4 p-5 ${
                application.status === 'accepted' ? 'border-green-500' :
                application.status === 'rejected' ? 'border-red-500' :
                application.status === 'in_review' ? 'border-amber-500' :
                'border-gray-400'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800">{application.name}</h3>
                      <Badge variant={STATUS_CONFIG[application.status].variant} size="sm">
                        {getStatusLabel(application.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{application.description}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {application.benefits}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mt-3">
                      {t('Applied on', 'आवेदन किया', 'விண்ணப்பித்தது', 'దరఖాస్తు చేసిన తేదీ')} {new Date(application.appliedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {application.officialUrl && (
                    <div className="shrink-0">
                      <a
                        href={application.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-4 py-2 text-teal-700 text-sm font-medium rounded-lg hover:bg-teal-50 transition-colors"
                      >
                        {t('View Details', 'विवरण देखें', 'விவரங்களைக் காண்க', 'వివరాలు చూడండి')}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
