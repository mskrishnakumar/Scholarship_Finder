import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import { getScholarships, deleteScholarship } from '../../services/apiClient'
import type { ScholarshipFull } from '../../services/apiClient'
import { PlusCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function DonorScholarships() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user } = useAuth()

  const [scholarships, setScholarships] = useState<ScholarshipFull[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

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

  const handleDelete = async (id: string) => {
    if (!user) return
    setActionLoading(true)
    try {
      await deleteScholarship(id, user.id, 'donor')
      setDeletingId(null)
      await fetchScholarships()
    } catch {
      setError(
        t(
          'Failed to delete scholarship',
          'छात्रवृत्ति हटाने में विफल',
          'உதவித்தொகையை நீக்க முடியவில்லை',
          'స్కాలర్‌షిప్ తొలగించడం విఫలమైంది'
        )
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditClick = (scholarship: ScholarshipFull) => {
    navigate(`/donor/scholarships/${scholarship.id}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t(
              'My Scholarships',
              'मेरी छात्रवृत्तियां',
              'எனது உதவித்தொகைகள்',
              'నా స్కాలర్‌షిప్‌లు'
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t(
              'Manage your scholarships and track their status',
              'अपनी छात्रवृत्तियां प्रबंधित करें और उनकी स्थिति ट्रैक करें',
              'உங்கள் உதவித்தொகைகளை நிர்வகிக்கவும் மற்றும் அவற்றின் நிலையைக் கண்காணிக்கவும்',
              'మీ స్కాలర్‌షిప్‌లను నిర్వహించండి మరియు వాటి స్థితిని ట్రాక్ చేయండి'
            )}
          </p>
        </div>
        <Link to="/donor/scholarships/new">
          <Button>
            <PlusCircleIcon className="w-5 h-5 mr-2" />
            {t('Create New', 'नया बनाएं', 'புதியது உருவாக்கு', 'కొత్తది సృష్టించు')}
          </Button>
        </Link>
      </div>

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

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            {t('Loading...', 'लोड हो रहा है...', 'ஏற்றுகிறது...', 'లోడ్ అవుతోంది...')}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && scholarships.length === 0 && (
        <Card padding="lg">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {t(
                'No scholarships yet',
                'अभी तक कोई छात्रवृत्ति नहीं',
                'இன்னும் உதவித்தொகைகள் இல்லை',
                'ఇంకా స్కాలర్‌షిప్‌లు లేవు'
              )}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {t(
                'Create your first scholarship to help students',
                'छात्रों की मदद के लिए अपनी पहली छात्रवृत्ति बनाएं',
                'மாணவர்களுக்கு உதவ உங்கள் முதல் உதவித்தொகையை உருவாக்குங்கள்',
                'విద్యార్థులకు సహాయం చేయడానికి మీ మొదటి స్కాలర్‌షిప్‌ను సృష్టించండి'
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

      {/* Scholarship List */}
      {!loading && scholarships.length > 0 && (
        <div className="space-y-3">
          {scholarships.map((scholarship) => (
            <Card key={scholarship.id} padding="none" hoverable>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => handleEditClick(scholarship)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {scholarship.name}
                      </h3>
                      <Badge status={scholarship.status as 'pending' | 'approved' | 'rejected'} />
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {scholarship.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      {scholarship.deadline && (
                        <span>
                          {t('Deadline:', 'अंतिम तिथि:', 'கடைசி தேதி:', 'గడువు:')}{' '}
                          {scholarship.deadline}
                        </span>
                      )}
                      {scholarship.createdAt && (
                        <span>
                          {t('Created:', 'निर्मित:', 'உருவாக்கியது:', 'సృష్టించబడింది:')}{' '}
                          {new Date(scholarship.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {deletingId === scholarship.id ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-red-600">
                        {t('Delete?', 'हटाएं?', 'நீக்கவா?', 'తొలగించాలా?')}
                      </span>
                      <button
                        onClick={() => handleDelete(scholarship.id)}
                        disabled={actionLoading}
                        className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        {t('Yes', 'हां', 'ஆம்', 'అవును')}
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="text-xs px-2 py-1 text-gray-600 hover:text-gray-800"
                      >
                        {t('No', 'नहीं', 'இல்லை', 'కాదు')}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEditClick(scholarship)}
                        className="p-2 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                        title={t('Edit', 'संपादित करें', 'திருத்து', 'సవరించు')}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(scholarship.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title={t('Delete', 'हटाएं', 'நீக்கு', 'తొలగించు')}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
