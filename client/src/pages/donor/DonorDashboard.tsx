import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { StatCard } from '../../components/common/StatCard'
import { Card, CardHeader } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { getScholarships } from '../../services/apiClient'
import type { ScholarshipFull } from '../../services/apiClient'
import {
  AcademicCapIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusCircleIcon,
  ListBulletIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'

export default function DonorDashboard() {
  const { t } = useLanguage()
  const { user, donorProfileComplete } = useAuth()

  const [scholarships, setScholarships] = useState<ScholarshipFull[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchScholarships = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getScholarships({ donorId: user.id }, user.id, 'donor')
      setScholarships(data)
      setError(null)
    } catch {
      setError(
        t(
          'Failed to load scholarships',
          'छात्रवृत्तियां लोड करने में विफल',
          'உதவித்தொகைகளை ஏற்ற முடியவில்லை',
          'స్కాలర్‌షిప్‌లు లోడ్ చేయడం విఫలమైంది'
        )
      )
    } finally {
      setLoading(false)
    }
  }, [user, t])

  useEffect(() => {
    fetchScholarships()
  }, [fetchScholarships])

  const totalCount = scholarships.length
  const approvedCount = scholarships.filter((s) => s.status === 'approved').length
  const pendingCount = scholarships.filter((s) => s.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Profile Completion Reminder Card */}
      {!donorProfileComplete && (
        <Card padding="lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {t(
                  'Complete Your Organization Profile',
                  'अपनी संगठन प्रोफ़ाइल पूरी करें',
                  'உங்கள் நிறுவன சுயவிவரத்தை பூர்த்தி செய்யுங்கள்',
                  'మీ సంస్థ ప్రొఫైల్‌ను పూర్తి చేయండి'
                )}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t(
                  'Please complete your organization profile before adding scholarships. This helps students learn more about your organization.',
                  'छात्रवृत्ति जोड़ने से पहले कृपया अपनी संगठन प्रोफ़ाइल पूरी करें। इससे छात्रों को आपके संगठन के बारे में अधिक जानने में मदद मिलती है।',
                  'உதவித்தொகைகளைச் சேர்ப்பதற்கு முன் உங்கள் நிறுவன சுயவிவரத்தை பூர்த்தி செய்யவும். இது மாணவர்கள் உங்கள் நிறுவனத்தைப் பற்றி மேலும் அறிய உதவுகிறது.',
                  'స్కాలర్‌షిప్‌లను జోడించడానికి ముందు మీ సంస్థ ప్రొఫైల్‌ను పూర్తి చేయండి. ఇది విద్యార్థులు మీ సంస్థ గురించి మరింత తెలుసుకోవడానికి సహాయపడుతుంది.'
                )}
              </p>
              <Link to="/donor/organization">
                <Button>
                  <UserCircleIcon className="w-5 h-5 mr-2" />
                  {t(
                    'Complete Profile',
                    'प्रोफ़ाइल पूरी करें',
                    'சுயவிவரத்தை பூர்த்தி செய்',
                    'ప్రొఫైల్ పూర్తి చేయండి'
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-card shadow-card p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            icon={AcademicCapIcon}
            label={t(
              'Total Scholarships',
              'कुल छात्रवृत्तियां',
              'மொத்த உதவித்தொகைகள்',
              'మొత్తం స్కాలర్‌షిప్‌లు'
            )}
            value={totalCount}
            color="amber"
          />
          <StatCard
            icon={CheckCircleIcon}
            label={t('Approved', 'स्वीकृत', 'அங்கீகரிக்கப்பட்டது', 'ఆమోదించబడింది')}
            value={approvedCount}
            color="amber"
          />
          <StatCard
            icon={ClockIcon}
            label={t(
              'Pending Review',
              'समीक्षा लंबित',
              'மதிப்பாய்வு நிலுவையில்',
              'సమీక్ష పెండింగ్'
            )}
            value={pendingCount}
            color="amber"
          />
        </div>
      )}

      {/* Quick Actions */}
      <Card padding="lg">
        <CardHeader
          title={t('Quick Actions', 'त्वरित कार्य', 'விரைவு செயல்கள்', 'త్వరిత చర్యలు')}
          subtitle={t(
            'Common tasks to manage your scholarships',
            'अपनी छात्रवृत्तियों को प्रबंधित करने के लिए सामान्य कार्य',
            'உங்கள் உதவித்தொகைகளை நிர்வகிக்க பொதுவான பணிகள்',
            'మీ స్కాలర్‌షిప్‌లను నిర్వహించడానికి సాధారణ పనులు'
          )}
        />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/donor/scholarships/new">
            <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100 hover:border-amber-300 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <PlusCircleIcon className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t(
                    'Create Scholarship',
                    'छात्रवृत्ति बनाएं',
                    'உதவித்தொகையை உருவாக்கு',
                    'స్కాలర్‌షిప్ సృష్టించు'
                  )}
                </h3>
                <p className="text-sm text-gray-500">
                  {t(
                    'Add a new scholarship opportunity',
                    'एक नया छात्रवृत्ति अवसर जोड़ें',
                    'புதிய உதவித்தொகை வாய்ப்பைச் சேர்க்கவும்',
                    'కొత్త స్కాలర్‌షిప్ అవకాశాన్ని జోడించండి'
                  )}
                </p>
              </div>
            </div>
          </Link>
          <Link to="/donor/scholarships">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <ListBulletIcon className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t(
                    'View All Scholarships',
                    'सभी छात्रवृत्तियां देखें',
                    'அனைத்து உதவித்தொகைகளையும் காண்க',
                    'అన్ని స్కాలర్‌షిప్‌లను చూడండి'
                  )}
                </h3>
                <p className="text-sm text-gray-500">
                  {t(
                    'Manage your existing scholarships',
                    'अपनी मौजूदा छात्रवृत्तियां प्रबंधित करें',
                    'உங்கள் தற்போதைய உதவித்தொகைகளை நிர்வகிக்கவும்',
                    'మీ ప్రస్తుత స్కాలర్‌షిప్‌లను నిర్వహించండి'
                  )}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </Card>

      {/* Recent Scholarships Preview */}
      {!loading && scholarships.length > 0 && (
        <Card padding="lg">
          <CardHeader
            title={t(
              'Recent Scholarships',
              'हाल की छात्रवृत्तियां',
              'சமீபத்திய உதவித்தொகைகள்',
              'ఇటీవలి స్కాలర్‌షిప్‌లు'
            )}
            action={
              <Link to="/donor/scholarships">
                <Button variant="secondary" size="sm">
                  {t('View All', 'सभी देखें', 'அனைத்தையும் காண்க', 'అన్నీ చూడండి')}
                </Button>
              </Link>
            }
          />
          <div className="mt-4 space-y-3">
            {scholarships.slice(0, 3).map((scholarship) => (
              <Link
                key={scholarship.id}
                to={`/donor/scholarships/${scholarship.id}`}
                className="block"
              >
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {scholarship.name}
                    </h4>
                    <p className="text-sm text-gray-500 truncate">
                      {scholarship.description}
                    </p>
                  </div>
                  <StatusBadge status={scholarship.status} t={t} />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && scholarships.length === 0 && (
        <Card padding="lg">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AcademicCapIcon className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t(
                'No scholarships yet',
                'अभी तक कोई छात्रवृत्ति नहीं',
                'இன்னும் உதவித்தொகைகள் இல்லை',
                'ఇంకా స్కాలర్‌షిప్‌లు లేవు'
              )}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {t(
                'Create your first scholarship to help students in need',
                'जरूरतमंद छात्रों की मदद के लिए अपनी पहली छात्रवृत्ति बनाएं',
                'தேவையான மாணவர்களுக்கு உதவ உங்கள் முதல் உதவித்தொகையை உருவாக்குங்கள்',
                'అవసరమైన విద్యార్థులకు సహాయం చేయడానికి మీ మొదటి స్కాలర్‌షిప్‌ను సృష్టించండి'
              )}
            </p>
            <Link to="/donor/scholarships/new">
              <Button>
                <PlusCircleIcon className="w-5 h-5 mr-2" />
                {t(
                  'Create Scholarship',
                  'छात्रवृत्ति बनाएं',
                  'உதவித்தொகையை உருவாக்கு',
                  'స్కాలర్‌షిప్ సృష్టించు'
                )}
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}

function StatusBadge({
  status,
  t,
}: {
  status: string
  t: (en: string, hi?: string, ta?: string, te?: string) => string
}) {
  const styles = {
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
  }
  const labels = {
    approved: t('Approved', 'स्वीकृत', 'அங்கீகரிக்கப்பட்டது', 'ఆమోదించబడింది'),
    pending: t('Pending', 'लंबित', 'நிலுவையில்', 'పెండింగ్'),
    rejected: t('Rejected', 'अस्वीकृत', 'நிராகரிக்கப்பட்டது', 'తిరస్కరించబడింది'),
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
  )
}
