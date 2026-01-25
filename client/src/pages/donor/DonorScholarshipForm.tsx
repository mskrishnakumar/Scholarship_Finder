import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import ScholarshipForm from '../../components/ScholarshipForm'
import {
  getScholarships,
  createScholarship,
  updateScholarship,
} from '../../services/apiClient'
import type { ScholarshipFull, CreateScholarshipRequest } from '../../services/apiClient'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function DonorScholarshipForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user, profile } = useAuth()

  const isEditMode = !!id

  const [scholarship, setScholarship] = useState<ScholarshipFull | null>(null)
  const [loading, setLoading] = useState(isEditMode)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchScholarship = useCallback(async () => {
    if (!user || !id) return
    setLoading(true)
    try {
      const data = await getScholarships({ donorId: user.id }, user.id, 'donor')
      const found = data.find((s) => s.id === id)
      if (found) {
        setScholarship(found)
        setError(null)
      } else {
        setError(
          t(
            'Scholarship not found',
            'छात्रवृत्ति नहीं मिली',
            'உதவித்தொகை கிடைக்கவில்லை',
            'స్కాలర్‌షిప్ కనుగొనబడలేదు'
          )
        )
      }
    } catch {
      setError(
        t(
          'Failed to load scholarship',
          'छात्रवृत्ति लोड करने में विफल',
          'உதவித்தொகையை ஏற்ற முடியவில்லை',
          'స్కాలర్‌షిప్ లోడ్ చేయడం విఫలమైంది'
        )
      )
    } finally {
      setLoading(false)
    }
  }, [user, id, t])

  useEffect(() => {
    if (isEditMode) {
      fetchScholarship()
    }
  }, [isEditMode, fetchScholarship])

  const handleCreate = async (data: CreateScholarshipRequest) => {
    if (!user) return
    setActionLoading(true)
    try {
      await createScholarship(
        { ...data, donorName: profile?.name || '' },
        user.id,
        'donor'
      )
      navigate('/donor/scholarships')
    } catch {
      setError(
        t(
          'Failed to create scholarship',
          'छात्रवृत्ति बनाने में विफल',
          'உதவித்தொகையை உருவாக்க முடியவில்லை',
          'స్కాలర్‌షిప్ సృష్టించడం విఫలమైంది'
        )
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdate = async (data: CreateScholarshipRequest) => {
    if (!user || !id) return
    setActionLoading(true)
    try {
      await updateScholarship(id, data, user.id, 'donor')
      navigate('/donor/scholarships')
    } catch {
      setError(
        t(
          'Failed to update scholarship',
          'छात्रवृत्ति अपडेट करने में विफल',
          'உதவித்தொகையை புதுப்பிக்க முடியவில்லை',
          'స్కాలర్‌షిప్ అప్‌డేట్ చేయడం విఫలమైంది'
        )
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/donor/scholarships')
  }

  const handleBack = () => {
    navigate('/donor/scholarships')
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        {t(
          'Back to Scholarships',
          'छात्रवृत्तियों पर वापस',
          'உதவித்தொகைகளுக்குத் திரும்பு',
          'స్కాలర్‌షిప్‌లకు తిరిగి'
        )}
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode
            ? t(
                'Edit Scholarship',
                'छात्रवृत्ति संपादित करें',
                'உதவித்தொகையைத் திருத்து',
                'స్కాలర్‌షిప్ సవరించు'
              )
            : t(
                'Create Scholarship',
                'छात्रवृत्ति बनाएं',
                'உதவித்தொகையை உருவாக்கு',
                'స్కాలర్‌షిప్ సృష్టించు'
              )}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isEditMode
            ? t(
                'Update the scholarship details below',
                'नीचे छात्रवृत्ति विवरण अपडेट करें',
                'கீழே உதவித்தொகை விவரங்களைப் புதுப்பிக்கவும்',
                'క్రింద స్కాలర్‌షిప్ వివరాలను అప్‌డేట్ చేయండి'
              )
            : t(
                'Fill in the details to create a new scholarship',
                'नई छात्रवृत्ति बनाने के लिए विवरण भरें',
                'புதிய உதவித்தொகையை உருவாக்க விவரங்களை நிரப்பவும்',
                'కొత్త స్కాలర్‌షిప్ సృష్టించడానికి వివరాలను నమోదు చేయండి'
              )}
        </p>
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
        <Card padding="lg">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              {t('Loading...', 'लोड हो रहा है...', 'ஏற்றுகிறது...', 'లోడ్ అవుతోంది...')}
            </p>
          </div>
        </Card>
      )}

      {/* Form */}
      {!loading && (
        <ScholarshipForm
          initialData={scholarship}
          onSubmit={isEditMode ? handleUpdate : handleCreate}
          onCancel={handleCancel}
          loading={actionLoading}
        />
      )}
    </div>
  )
}
