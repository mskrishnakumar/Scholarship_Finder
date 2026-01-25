import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  PlusIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import ScholarshipForm from '../../components/ScholarshipForm'
import {
  getScholarships,
  createScholarship,
  updateScholarship,
  deleteScholarship,
  updateScholarshipStatus,
} from '../../services/apiClient'
import type {
  ScholarshipFull,
  CreateScholarshipRequest,
  ScholarshipStatus,
} from '../../services/apiClient'

type ViewMode = 'list' | 'create' | 'edit' | 'view'
type StatusFilter = 'all' | ScholarshipStatus

export default function AdminScholarships() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user } = useAuth()

  const [scholarships, setScholarships] = useState<ScholarshipFull[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedScholarship, setSelectedScholarship] = useState<ScholarshipFull | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  const fetchScholarships = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getScholarships({}, user.id, 'admin')
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

  const handleCreate = async (data: CreateScholarshipRequest) => {
    if (!user) return
    setActionLoading(true)
    try {
      await createScholarship(
        { ...data, type: 'public', status: 'approved' },
        user.id,
        'admin'
      )
      setViewMode('list')
      await fetchScholarships()
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
    if (!user || !selectedScholarship) return
    setActionLoading(true)
    try {
      await updateScholarship(selectedScholarship.id, data, user.id, 'admin')
      setViewMode('list')
      setSelectedScholarship(null)
      await fetchScholarships()
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

  const handleDelete = async (id: string) => {
    if (!user) return
    setActionLoading(true)
    try {
      await deleteScholarship(id, user.id, 'admin')
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

  const handleStatusChange = async (id: string, status: ScholarshipStatus) => {
    if (!user) return
    setActionLoading(true)
    try {
      await updateScholarshipStatus(id, status, user.id, 'admin')
      await fetchScholarships()
    } catch {
      setError(
        t(
          'Failed to update status',
          'स्थिति अपडेट करने में विफल',
          'நிலையை புதுப்பிக்க முடியவில்லை',
          'స్టేటస్ అప్‌డేట్ చేయడం విఫలమైంది'
        )
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = () => {
    setViewMode('list')
    setSelectedScholarship(null)
  }

  const handleEdit = (scholarship: ScholarshipFull) => {
    setSelectedScholarship(scholarship)
    setViewMode('edit')
  }

  const handleView = (scholarship: ScholarshipFull) => {
    setSelectedScholarship(scholarship)
    setViewMode('view')
  }

  // Filter scholarships
  const filteredScholarships = scholarships
    .filter((s) => statusFilter === 'all' || s.status === statusFilter)
    .filter(
      (s) =>
        searchQuery === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.donorName && s.donorName.toLowerCase().includes(searchQuery.toLowerCase()))
    )

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: t('All Status', 'सभी स्थिति', 'அனைத்து நிலை', 'అన్ని స్టేటస్') },
    { value: 'approved', label: t('Approved', 'स्वीकृत', 'அங்கீகரிக்கப்பட்டது', 'ఆమోదించబడింది') },
    { value: 'pending', label: t('Pending', 'लंबित', 'நிலுவையில்', 'పెండింగ్') },
    { value: 'rejected', label: t('Rejected', 'अस्वीकृत', 'நிராகரிக்கப்பட்டது', 'తిరస్కరించబడింది') },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Create/Edit View
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="space-y-4">
        <button
          onClick={handleCancel}
          className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {t('Back to list', 'सूची पर वापस', 'பட்டியலுக்குத் திரும்பு', 'జాబితాకు తిరిగి')}
        </button>

        <h2 className="text-xl font-bold text-text-primary">
          {viewMode === 'create'
            ? t(
                'Add Scholarship',
                'छात्रवृत्ति जोड़ें',
                'உதவித்தொகை சேர்',
                'స్కాలర్‌షిప్ జోడించు'
              )
            : t(
                'Edit Scholarship',
                'छात्रवृत्ति संपादित करें',
                'உதவித்தொகையைத் திருத்து',
                'స్కాలర్‌షిప్ సవరించు'
              )}
        </h2>

        <ScholarshipForm
          initialData={viewMode === 'edit' ? selectedScholarship || undefined : undefined}
          onSubmit={viewMode === 'create' ? handleCreate : handleUpdate}
          onCancel={handleCancel}
          loading={actionLoading}
        />
      </div>
    )
  }

  // View Details
  if (viewMode === 'view' && selectedScholarship) {
    return (
      <div className="space-y-4">
        <button
          onClick={handleCancel}
          className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {t('Back to list', 'सूची पर वापस', 'பட்டியலுக்குத் திரும்பு', 'జాబితాకు తిరిగి')}
        </button>

        <Card padding="lg">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                {selectedScholarship.name}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge status={selectedScholarship.status} />
                <span className="text-sm text-text-secondary">
                  {selectedScholarship.type === 'public'
                    ? t('Public', 'सार्वजनिक', 'பொது', 'పబ్లిక్')
                    : t('Private', 'निजी', 'தனிப்பட்ட', 'ప్రైవేట్')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleEdit(selectedScholarship)}
              >
                <PencilIcon className="w-4 h-4 mr-1" />
                {t('Edit', 'संपादित करें', 'திருத்து', 'సవరించు')}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-1">
                {t('Description', 'विवरण', 'விளக்கம்', 'వివరణ')}
              </h3>
              <p className="text-text-primary">{selectedScholarship.description}</p>
            </div>

            {selectedScholarship.donorName && (
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-1">
                  {t('Donor', 'दानदाता', 'நன்கொடையாளர்', 'దాత')}
                </h3>
                <p className="text-text-primary">{selectedScholarship.donorName}</p>
              </div>
            )}

            {selectedScholarship.deadline && (
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-1">
                  {t('Deadline', 'अंतिम तिथि', 'கடைசி தேதி', 'గడువు')}
                </h3>
                <p className="text-text-primary">{selectedScholarship.deadline}</p>
              </div>
            )}

            {selectedScholarship.benefits && (
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-1">
                  {t('Benefits', 'लाभ', 'நன்மைகள்', 'ప్రయోజనాలు')}
                </h3>
                <p className="text-text-primary">{selectedScholarship.benefits}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-1">
                {t('Created', 'निर्मित', 'உருவாக்கியது', 'సృష్టించబడింది')}
              </h3>
              <p className="text-text-primary">
                {new Date(selectedScholarship.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // List View
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            {t(
              'All Scholarships',
              'सभी छात्रवृत्तियां',
              'அனைத்து உதவித்தொகைகள்',
              'అన్ని స్కాలర్‌షిప్‌లు'
            )}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {t(
              'Manage and approve scholarships',
              'छात्रवृत्तियां प्रबंधित करें और स्वीकृत करें',
              'உதவித்தொகைகளை நிர்வகிக்கவும் மற்றும் ஒப்புக்கொள்ளவும்',
              'స్కాలర్‌షిప్‌లను నిర్వహించండి మరియు ఆమోదించండి'
            )}
          </p>
        </div>
        <Button onClick={() => setViewMode('create')}>
          <PlusIcon className="w-4 h-4 mr-2" />
          {t('Add Scholarship', 'छात्रवृत्ति जोड़ें', 'உதவித்தொகை சேர்', 'స్కాలర్‌షిప్ జోడించు')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder={t(
              'Search scholarships...',
              'छात्रवृत्ति खोजें...',
              'உதவித்தொகைகளைத் தேடு...',
              'స్కాలర్‌షిప్‌లు శోధించండి...'
            )}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
          >
            <span className="text-sm text-text-primary">
              {statusOptions.find((o) => o.value === statusFilter)?.label}
            </span>
            <ChevronDownIcon className="w-4 h-4 text-text-secondary" />
          </button>
          {showFilterDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowFilterDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setStatusFilter(option.value)
                      setShowFilterDropdown(false)
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                      statusFilter === option.value
                        ? 'bg-primary-light text-primary-dark'
                        : 'text-text-primary'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-text-secondary">
        {t(
          `Showing ${filteredScholarships.length} scholarship${filteredScholarships.length !== 1 ? 's' : ''}`,
          `${filteredScholarships.length} छात्रवृत्तियां दिखा रहा है`,
          `${filteredScholarships.length} உதவித்தொகைகள் காட்டப்படுகின்றன`,
          `${filteredScholarships.length} స్కాలర్‌షిప్‌లు చూపిస్తోంది`
        )}
      </p>

      {/* Scholarship List */}
      {filteredScholarships.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-8">
            <p className="text-text-secondary">
              {searchQuery || statusFilter !== 'all'
                ? t(
                    'No scholarships match your filters',
                    'आपके फ़िल्टर से कोई छात्रवृत्ति मेल नहीं खाती',
                    'உங்கள் வடிகட்டிகளுக்கு பொருந்தும் உதவித்தொகைகள் இல்லை',
                    'మీ ఫిల్టర్‌లకు సరిపోయే స్కాలర్‌షిప్‌లు లేవు'
                  )
                : t(
                    'No scholarships found',
                    'कोई छात्रवृत्ति नहीं मिली',
                    'உதவித்தொகைகள் இல்லை',
                    'స్కాలర్‌షిప్‌లు కనుగొనబడలేదు'
                  )}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredScholarships.map((scholarship) => (
            <Card key={scholarship.id} padding="md" hoverable>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm font-semibold text-text-primary truncate">
                      {scholarship.name}
                    </h3>
                    <Badge status={scholarship.status} size="sm" />
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        scholarship.type === 'public'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-purple-50 text-purple-600'
                      }`}
                    >
                      {scholarship.type === 'public'
                        ? t('Public', 'सार्वजनिक', 'பொது', 'పబ్లిక్')
                        : t('Donor', 'दानदाता', 'நன்கொடையாளர்', 'దాత')}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                    {scholarship.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-text-secondary flex-wrap">
                    {scholarship.donorName && (
                      <span>
                        {t('Donor:', 'दानदाता:', 'நன்கொடையாளர்:', 'దాత:')}{' '}
                        {scholarship.donorName}
                      </span>
                    )}
                    {scholarship.deadline && (
                      <span>
                        {t('Deadline:', 'अंतिम तिथि:', 'கடைசி தேதி:', 'గడువు:')}{' '}
                        {scholarship.deadline}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {deletingId === scholarship.id ? (
                    <div className="flex items-center gap-2">
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
                    <>
                      {scholarship.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(scholarship.id, 'approved')}
                            disabled={actionLoading}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title={t('Approve', 'स्वीकृत करें', 'அங்கீகரி', 'ఆమోదించు')}
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleStatusChange(scholarship.id, 'rejected')}
                            disabled={actionLoading}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title={t('Reject', 'अस्वीकृत करें', 'நிராகரி', 'తిరస్కరించు')}
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleView(scholarship)}
                        className="p-2 text-text-secondary hover:text-primary hover:bg-primary-light rounded-lg transition-colors"
                        title={t('View', 'देखें', 'காண்', 'చూడండి')}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(scholarship)}
                        className="p-2 text-text-secondary hover:text-primary hover:bg-primary-light rounded-lg transition-colors"
                        title={t('Edit', 'संपादित करें', 'திருத்து', 'సవరించు')}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(scholarship.id)}
                        className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={t('Delete', 'हटाएं', 'நீக்கு', 'తొలగించు')}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </>
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
