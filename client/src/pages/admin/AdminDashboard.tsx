import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  UsersIcon,
  AcademicCapIcon,
  ClockIcon,
  UserCircleIcon,
  ExclamationCircleIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { StatCard } from '../../components/common/StatCard'
import { Card, CardHeader } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import {
  getScholarships,
  getUsers,
  updateScholarshipStatus,
} from '../../services/apiClient'
import type { ScholarshipFull, UserInfo } from '../../services/apiClient'

export default function AdminDashboard() {
  const { t } = useLanguage()
  const { user } = useAuth()

  const [scholarships, setScholarships] = useState<ScholarshipFull[]>([])
  const [users, setUsers] = useState<UserInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [scholarshipsData, usersData] = await Promise.all([
        getScholarships({}, user.id, 'admin'),
        getUsers(user.id, 'admin'),
      ])
      setScholarships(scholarshipsData)
      setUsers(usersData.users)
      setError(null)
    } catch {
      setError(
        t(
          'Failed to load data',
          'डेटा लोड करने में विफल',
          'தரவை ஏற்ற முடியவில்லை',
          'డేటా లోడ్ చేయడం విఫలమైంది'
        )
      )
    } finally {
      setLoading(false)
    }
  }, [user, t])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleApprove = async (id: string) => {
    if (!user) return
    setActionLoading(id)
    try {
      await updateScholarshipStatus(id, 'approved', user.id, 'admin')
      await fetchData()
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
      await fetchData()
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

  // Calculate stats
  const totalUsers = users.length
  const totalScholarships = scholarships.length
  const pendingScholarships = scholarships.filter((s) => s.status === 'pending')
  const pendingCount = pendingScholarships.length
  const activeStudents = users.filter((u) => u.role === 'student').length

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
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          icon={UsersIcon}
          label={t('Total Users', 'कुल उपयोगकर्ता', 'மொத்த பயனர்கள்', 'మొత్తం యూజర్లు')}
          value={totalUsers}
          color="teal"
        />
        <StatCard
          icon={AcademicCapIcon}
          label={t(
            'Total Scholarships',
            'कुल छात्रवृत्तियां',
            'மொத்த உதவித்தொகைகள்',
            'మొత్తం స్కాలర్‌షిప్‌లు'
          )}
          value={totalScholarships}
          color="blue"
        />
        <div className="relative">
          <StatCard
            icon={ClockIcon}
            label={t(
              'Pending Approval',
              'लंबित अनुमोदन',
              'நிலுவையில் உள்ள அங்கீகாரம்',
              'పెండింగ్ ఆమోదం'
            )}
            value={pendingCount}
            color="amber"
          />
          {pendingCount > 0 && (
            <span className="absolute top-3 right-3 inline-flex items-center justify-center w-6 h-6 text-xs font-bold bg-amber-500 text-white rounded-full">
              {pendingCount}
            </span>
          )}
        </div>
        <StatCard
          icon={UserCircleIcon}
          label={t(
            'Active Students',
            'सक्रिय छात्र',
            'செயலில் உள்ள மாணவர்கள்',
            'యాక్టివ్ విద్యార్థులు'
          )}
          value={activeStudents}
          color="cyan"
        />
      </div>

      {/* Requires Attention Section */}
      <Card padding="lg">
        <CardHeader
          title={t(
            'Requires Attention',
            'ध्यान देने की आवश्यकता',
            'கவனம் தேவை',
            'దృష్టి అవసరం'
          )}
          subtitle={t(
            'Pending scholarship approvals',
            'लंबित छात्रवृत्ति अनुमोदन',
            'நிலுவையில் உள்ள உதவித்தொகை அங்கீகாரங்கள்',
            'పెండింగ్ స్కాలర్‌షిప్ ఆమోదాలు'
          )}
          action={
            pendingCount > 0 ? (
              <Link to="/admin/pending">
                <Button variant="secondary" size="sm">
                  {t('View All', 'सभी देखें', 'அனைத்தையும் காண்', 'అన్నీ చూడండి')}
                </Button>
              </Link>
            ) : undefined
          }
          className="mb-4"
        />

        {pendingCount === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <CheckIcon className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p>
              {t(
                'All caught up! No pending approvals.',
                'सब हो गया! कोई लंबित अनुमोदन नहीं।',
                'எல்லாம் முடிந்தது! நிலுவையில் அங்கீகாரங்கள் இல்லை.',
                'అన్నీ పూర్తయ్యాయి! పెండింగ్ ఆమోదాలు లేవు.'
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingScholarships.slice(0, 5).map((scholarship) => (
              <div
                key={scholarship.id}
                className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <ExclamationCircleIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <h4 className="text-sm font-medium text-text-primary truncate">
                      {scholarship.name}
                    </h4>
                    <Badge status="pending" size="sm" />
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-1 ml-6">
                    {scholarship.description}
                  </p>
                  {scholarship.donorName && (
                    <p className="text-xs text-text-secondary mt-1 ml-6">
                      {t('Donor:', 'दानदाता:', 'நன்கொடையாளர்:', 'దాత:')}{' '}
                      {scholarship.donorName}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApprove(scholarship.id)}
                    isLoading={actionLoading === scholarship.id}
                    disabled={actionLoading !== null}
                  >
                    <CheckIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleReject(scholarship.id)}
                    isLoading={actionLoading === scholarship.id}
                    disabled={actionLoading !== null}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {pendingCount > 5 && (
              <div className="text-center pt-2">
                <Link
                  to="/admin/pending"
                  className="text-sm text-primary hover:text-primary-dark font-medium"
                >
                  {t(
                    `View ${pendingCount - 5} more pending items`,
                    `${pendingCount - 5} और लंबित आइटम देखें`,
                    `மேலும் ${pendingCount - 5} நிலுவையில் உள்ள உருப்படிகளைக் காண்க`,
                    `మరో ${pendingCount - 5} పెండింగ్ ఐటెమ్‌లు చూడండి`
                  )}
                </Link>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <Card padding="lg">
          <CardHeader
            title={t(
              'User Distribution',
              'उपयोगकर्ता वितरण',
              'பயனர் விநியோகம்',
              'యూజర్ పంపిణీ'
            )}
            className="mb-4"
          />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                {t('Students', 'छात्र', 'மாணவர்கள்', 'విద్యార్థులు')}
              </span>
              <span className="text-sm font-medium text-text-primary">
                {users.filter((u) => u.role === 'student').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                {t('Donors', 'दानदाता', 'நன்கொடையாளர்கள்', 'దాతలు')}
              </span>
              <span className="text-sm font-medium text-text-primary">
                {users.filter((u) => u.role === 'donor').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                {t('Admins', 'व्यवस्थापक', 'நிர்வாகிகள்', 'అడ్మిన్లు')}
              </span>
              <span className="text-sm font-medium text-text-primary">
                {users.filter((u) => u.role === 'admin').length}
              </span>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <CardHeader
            title={t(
              'Scholarship Status',
              'छात्रवृत्ति स्थिति',
              'உதவித்தொகை நிலை',
              'స్కాలర్‌షిప్ స్టేటస్'
            )}
            className="mb-4"
          />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                {t('Approved', 'स्वीकृत', 'அங்கீகரிக்கப்பட்டது', 'ఆమోదించబడింది')}
              </span>
              <span className="text-sm font-medium text-green-600">
                {scholarships.filter((s) => s.status === 'approved').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                {t('Pending', 'लंबित', 'நிலுவையில்', 'పెండింగ్')}
              </span>
              <span className="text-sm font-medium text-amber-600">
                {pendingCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                {t('Rejected', 'अस्वीकृत', 'நிராகரிக்கப்பட்டது', 'తిరస్కరించబడింది')}
              </span>
              <span className="text-sm font-medium text-red-600">
                {scholarships.filter((s) => s.status === 'rejected').length}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
