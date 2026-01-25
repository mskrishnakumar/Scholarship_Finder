import { useState, useEffect, useCallback } from 'react'
import {
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import {
  getScholarships,
  updateScholarshipStatus,
} from '../../services/apiClient'
import type { ScholarshipFull } from '../../services/apiClient'

export default function AdminPending() {
  const { t } = useLanguage()
  const { user } = useAuth()

  const [scholarships, setScholarships] = useState<ScholarshipFull[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchScholarships = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getScholarships({ status: 'pending' }, user.id, 'admin')
      setScholarships(data)
      setError(null)
    } catch {
      setError(
        t(
          'Failed to load pending scholarships',
          'लंबित छात्रवृत्तियां लोड करने में विफल',
          'நிலுவையில் உள்ள உதவித்தொகைகளை ஏற்ற முடியவில்லை',
          'పెండింగ్ స్కాలర్‌షిప్‌లు లోడ్ చేయడం విఫలమైంది'
        )
      )
    } finally {
      setLoading(false)
    }
  }, [user, t])

  useEffect(() => {
    fetchScholarships()
  }, [fetchScholarships])

  const handleApprove = async (id: string) => {
    if (!user) return
    setActionLoading(id)
    try {
      await updateScholarshipStatus(id, 'approved', user.id, 'admin')
      await fetchScholarships()
    } catch {
      setError(
        t(
          'Failed to approve scholarship',
          'छात्रवृत्ति स्वीकृत करने में विफल',
          'உதவித்தொகையை அங்கீகரிக்க முடியவில்லை',
          'స్కాలర్‌షిప్ ఆమోదించడం విఫలమైంది'
        )
      )
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: string) => {
    if (!user) return
    setActionLoading(id)
    try {
      await updateScholarshipStatus(id, 'rejected', user.id, 'admin')
      await fetchScholarships()
    } catch {
      setError(
        t(
          'Failed to reject scholarship',
          'छात्रवृत्ति अस्वीकृत करने में विफल',
          'உதவித்தொகையை நிராகரிக்க முடியவில்லை',
          'స్కాలర్‌షిప్ తిరస్కరించడం విఫలమైంది'
        )
      )
    } finally {
      setActionLoading(null)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <ClockIcon className="w-6 h-6 text-amber-500" />
          {t(
            'Pending Approvals',
            'लंबित अनुमोदन',
            'நிலுவையில் உள்ள அங்கீகாரங்கள்',
            'పెండింగ్ ఆమోదాలు'
          )}
          {scholarships.length > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold bg-amber-500 text-white rounded-full">
              {scholarships.length}
            </span>
          )}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {t(
            'Review and approve scholarship submissions',
            'छात्रवृत्ति प्रस्तुतियों की समीक्षा करें और स्वीकृत करें',
            'உதவித்தொகை சமர்ப்பிப்புகளை மதிப்பாய்வு செய்து அங்கீகரிக்கவும்',
            'స్కాలర్‌షిప్ సమర్పణలను సమీక్షించి ఆమోదించండి'
          )}
        </p>
      </div>

      {/* Empty State */}
      {scholarships.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-12">
            <CheckIcon className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              {t(
                'All caught up!',
                'सब हो गया!',
                'எல்லாம் முடிந்தது!',
                'అన్నీ పూర్తయ్యాయి!'
              )}
            </h2>
            <p className="text-text-secondary">
              {t(
                'No scholarships pending approval at this time.',
                'इस समय कोई छात्रवृत्ति अनुमोदन के लिए लंबित नहीं है।',
                'இந்த நேரத்தில் அங்கீகாரத்திற்காக நிலுவையில் உள்ள உதவித்தொகைகள் இல்லை.',
                'ఈ సమయంలో ఆమోదం కోసం పెండింగ్‌లో ఉన్న స్కాలర్‌షిప్‌లు లేవు.'
              )}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {scholarships.map((scholarship) => (
            <Card key={scholarship.id} padding="none" hoverable>
              {/* Header Row */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <ExclamationCircleIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      <h3 className="text-base font-semibold text-text-primary truncate">
                        {scholarship.name}
                      </h3>
                      <Badge status="pending" size="sm" />
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-2">
                      {scholarship.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary flex-wrap">
                      {scholarship.donorName && (
                        <span>
                          {t('Donor:', 'दानदाता:', 'நன்கொடையாளர்:', 'దాత:')}{' '}
                          <span className="font-medium text-text-primary">
                            {scholarship.donorName}
                          </span>
                        </span>
                      )}
                      {scholarship.deadline && (
                        <span>
                          {t('Deadline:', 'अंतिम तिथि:', 'கடைசி தேதி:', 'గడువు:')}{' '}
                          <span className="font-medium text-text-primary">
                            {scholarship.deadline}
                          </span>
                        </span>
                      )}
                      <span>
                        {t('Submitted:', 'प्रस्तुत:', 'சமர்ப்பிக்கப்பட்டது:', 'సమర్పించబడింది:')}{' '}
                        <span className="font-medium text-text-primary">
                          {new Date(scholarship.createdAt).toLocaleDateString()}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(scholarship.id)}
                      isLoading={actionLoading === scholarship.id}
                      disabled={actionLoading !== null}
                    >
                      <CheckIcon className="w-4 h-4 sm:mr-1" />
                      <span className="hidden sm:inline">
                        {t('Approve', 'स्वीकृत करें', 'அங்கீகரி', 'ఆమోదించు')}
                      </span>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleReject(scholarship.id)}
                      isLoading={actionLoading === scholarship.id}
                      disabled={actionLoading !== null}
                    >
                      <XMarkIcon className="w-4 h-4 sm:mr-1" />
                      <span className="hidden sm:inline">
                        {t('Reject', 'अस्वीकृत करें', 'நிராகரி', 'తిరస్కరించు')}
                      </span>
                    </Button>
                  </div>
                </div>

                {/* Expand Toggle */}
                <button
                  onClick={() => toggleExpand(scholarship.id)}
                  className="mt-3 flex items-center gap-1 text-sm text-primary hover:text-primary-dark font-medium"
                >
                  {expandedId === scholarship.id ? (
                    <>
                      <ChevronUpIcon className="w-4 h-4" />
                      {t('Show less', 'कम दिखाएं', 'குறைவாகக் காட்டு', 'తక్కువ చూపించు')}
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="w-4 h-4" />
                      {t('Show details', 'विवरण दिखाएं', 'விவரங்களைக் காட்டு', 'వివరాలు చూపించు')}
                    </>
                  )}
                </button>
              </div>

              {/* Expanded Details */}
              {expandedId === scholarship.id && (
                <div className="border-t border-gray-100 p-4 sm:p-5 bg-gray-50 space-y-4">
                  {scholarship.benefits && (
                    <div>
                      <h4 className="text-sm font-medium text-text-secondary mb-1">
                        {t('Benefits', 'लाभ', 'நன்மைகள்', 'ప్రయోజనాలు')}
                      </h4>
                      <p className="text-sm text-text-primary">{scholarship.benefits}</p>
                    </div>
                  )}

                  {scholarship.eligibility && (
                    <div>
                      <h4 className="text-sm font-medium text-text-secondary mb-2">
                        {t('Eligibility Criteria', 'पात्रता मापदंड', 'தகுதி அளவுகோல்', 'అర్హత ప్రమాణాలు')}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        {scholarship.eligibility.states?.length > 0 && (
                          <div>
                            <span className="text-text-secondary">
                              {t('States:', 'राज्य:', 'மாநிலங்கள்:', 'రాష్ట్రాలు:')}
                            </span>{' '}
                            <span className="text-text-primary">
                              {scholarship.eligibility.states.join(', ')}
                            </span>
                          </div>
                        )}
                        {scholarship.eligibility.categories?.length > 0 && (
                          <div>
                            <span className="text-text-secondary">
                              {t('Categories:', 'श्रेणियां:', 'வகைகள்:', 'వర్గాలు:')}
                            </span>{' '}
                            <span className="text-text-primary">
                              {scholarship.eligibility.categories.join(', ')}
                            </span>
                          </div>
                        )}
                        {scholarship.eligibility.maxIncome && (
                          <div>
                            <span className="text-text-secondary">
                              {t('Max Income:', 'अधिकतम आय:', 'அதிகபட்ச வருமானம்:', 'గరిష్ట ఆదాయం:')}
                            </span>{' '}
                            <span className="text-text-primary">
                              Rs. {scholarship.eligibility.maxIncome.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {scholarship.eligibility.gender && scholarship.eligibility.gender !== 'any' && (
                          <div>
                            <span className="text-text-secondary">
                              {t('Gender:', 'लिंग:', 'பாலினம்:', 'లింగం:')}
                            </span>{' '}
                            <span className="text-text-primary capitalize">
                              {scholarship.eligibility.gender}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {scholarship.applicationSteps?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-text-secondary mb-2">
                        {t('Application Steps', 'आवेदन चरण', 'விண்ணப்ப படிகள்', 'దరఖాస్తు దశలు')}
                      </h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-text-primary">
                        {scholarship.applicationSteps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {scholarship.requiredDocuments?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-text-secondary mb-2">
                        {t('Required Documents', 'आवश्यक दस्तावेज', 'தேவையான ஆவணங்கள்', 'అవసరమైన పత్రాలు')}
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-text-primary">
                        {scholarship.requiredDocuments.map((doc, index) => (
                          <li key={index}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {scholarship.officialUrl && (
                    <div>
                      <h4 className="text-sm font-medium text-text-secondary mb-1">
                        {t('Official URL', 'आधिकारिक URL', 'அதிகாரப்பூர்வ URL', 'అధికారిక URL')}
                      </h4>
                      <a
                        href={scholarship.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline break-all"
                      >
                        {scholarship.officialUrl}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
