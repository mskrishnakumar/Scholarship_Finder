import { useState, useEffect, useCallback } from 'react'
import {
  UsersIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronDownIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { getUsers } from '../../services/apiClient'
import type { UserInfo } from '../../services/apiClient'

type RoleFilter = 'all' | 'student' | 'donor' | 'admin'

export default function AdminUsers() {
  const { t } = useLanguage()
  const { user } = useAuth()

  const [users, setUsers] = useState<UserInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  const fetchUsers = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getUsers(user.id, 'admin')
      setUsers(data.users)
      setError(null)
    } catch {
      setError(
        t(
          'Failed to load users',
          'उपयोगकर्ता लोड करने में विफल',
          'பயனர்களை ஏற்ற முடியவில்லை',
          'యూజర్లను లోడ్ చేయడం విఫలమైంది'
        )
      )
    } finally {
      setLoading(false)
    }
  }, [user, t])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Filter users
  const filteredUsers = users
    .filter((u) => roleFilter === 'all' || u.role === roleFilter)
    .filter(
      (u) =>
        searchQuery === '' ||
        (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

  // Role counts
  const studentCount = users.filter((u) => u.role === 'student').length
  const donorCount = users.filter((u) => u.role === 'donor').length
  const adminCount = users.filter((u) => u.role === 'admin').length

  const roleOptions: { value: RoleFilter; label: string; count: number }[] = [
    {
      value: 'all',
      label: t('All Roles', 'सभी भूमिकाएं', 'அனைத்து பாத்திரங்கள்', 'అన్ని పాత్రలు'),
      count: users.length,
    },
    {
      value: 'student',
      label: t('Students', 'छात्र', 'மாணவர்கள்', 'విద్యార్థులు'),
      count: studentCount,
    },
    {
      value: 'donor',
      label: t('Donors', 'दानदाता', 'நன்கொடையாளர்கள்', 'దాతలు'),
      count: donorCount,
    },
    {
      value: 'admin',
      label: t('Admins', 'व्यवस्थापक', 'நிர்வாகிகள்', 'అడ్మిన్లు'),
      count: adminCount,
    },
  ]

  const getRoleBadgeVariant = (role: string): 'primary' | 'warning' | 'accent' | 'default' => {
    switch (role) {
      case 'student':
        return 'primary'
      case 'donor':
        return 'warning'
      case 'admin':
        return 'accent'
      default:
        return 'default'
    }
  }

  const getRoleLabel = (role: string): string => {
    switch (role) {
      case 'student':
        return t('Student', 'छात्र', 'மாணவர்', 'విద్యార్థి')
      case 'donor':
        return t('Donor', 'दानदाता', 'நன்கொடையாளர்', 'దాత')
      case 'admin':
        return t('Admin', 'व्यवस्थापक', 'நிர்வாகி', 'అడ్మిన్')
      default:
        return role
    }
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
          <UsersIcon className="w-6 h-6 text-primary" />
          {t('User Management', 'उपयोगकर्ता प्रबंधन', 'பயனர் மேலாண்மை', 'యూజర్ మేనేజ్‌మెంట్')}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {t(
            'View all registered users',
            'सभी पंजीकृत उपयोगकर्ता देखें',
            'அனைத்து பதிவு செய்த பயனர்களையும் காணவும்',
            'అన్ని నమోదైన యూజర్లను చూడండి'
          )}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-text-primary">{users.length}</div>
          <div className="text-xs text-text-secondary">
            {t('Total', 'कुल', 'மொத்தம்', 'మొత్తం')}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-teal-600">{studentCount}</div>
          <div className="text-xs text-text-secondary">
            {t('Students', 'छात्र', 'மாணவர்கள்', 'విద్యార్థులు')}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-amber-600">{donorCount}</div>
          <div className="text-xs text-text-secondary">
            {t('Donors', 'दानदाता', 'நன்கொடையாளர்கள்', 'దాతలు')}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-purple-600">{adminCount}</div>
          <div className="text-xs text-text-secondary">
            {t('Admins', 'व्यवस्थापक', 'நிர்வாகிகள்', 'అడ్మిన్లు')}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder={t(
              'Search by name or email...',
              'नाम या ईमेल से खोजें...',
              'பெயர் அல்லது மின்னஞ்சல் மூலம் தேடு...',
              'పేరు లేదా ఈమెయిల్ ద్వారా శోధించండి...'
            )}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
          />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 min-w-[160px]"
          >
            <span className="text-sm text-text-primary flex-1 text-left">
              {roleOptions.find((o) => o.value === roleFilter)?.label}
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
                {roleOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setRoleFilter(option.value)
                      setShowFilterDropdown(false)
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg flex items-center justify-between ${
                      roleFilter === option.value
                        ? 'bg-primary-light text-primary-dark'
                        : 'text-text-primary'
                    }`}
                  >
                    <span>{option.label}</span>
                    <span className="text-xs text-text-secondary">{option.count}</span>
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
          `Showing ${filteredUsers.length} user${filteredUsers.length !== 1 ? 's' : ''}`,
          `${filteredUsers.length} उपयोगकर्ता दिखा रहा है`,
          `${filteredUsers.length} பயனர்கள் காட்டப்படுகின்றன`,
          `${filteredUsers.length} యూజర్లు చూపిస్తోంది`
        )}
      </p>

      {/* User List */}
      {filteredUsers.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-8">
            <UserCircleIcon className="w-12 h-12 mx-auto mb-3 text-text-secondary" />
            <p className="text-text-secondary">
              {searchQuery || roleFilter !== 'all'
                ? t(
                    'No users match your filters',
                    'आपके फ़िल्टर से कोई उपयोगकर्ता मेल नहीं खाता',
                    'உங்கள் வடிகட்டிகளுக்கு பொருந்தும் பயனர்கள் இல்லை',
                    'మీ ఫిల్టర్‌లకు సరిపోయే యూజర్లు లేవు'
                  )
                : t(
                    'No users found',
                    'कोई उपयोगकर्ता नहीं मिला',
                    'பயனர்கள் இல்லை',
                    'యూజర్లు కనుగొనబడలేదు'
                  )}
            </p>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">
                    {t('Name', 'नाम', 'பெயர்', 'పేరు')}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">
                    {t('Email', 'ईमेल', 'மின்னஞ்சல்', 'ఈమెయిల్')}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">
                    {t('Role', 'भूमिका', 'பங்கு', 'పాత్ర')}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">
                    {t('Joined', 'शामिल हुए', 'சேர்ந்தது', 'చేరారు')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <UserCircleIcon className="w-5 h-5 text-text-secondary" />
                        </div>
                        <span className="font-medium text-text-primary">
                          {u.name || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={getRoleBadgeVariant(u.role)} size="sm">
                        {getRoleLabel(u.role)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
