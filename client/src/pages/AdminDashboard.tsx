import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import LanguageToggle from '../components/LanguageToggle'
import ScholarshipForm from '../components/ScholarshipForm'
import {
  getScholarships, createScholarship, updateScholarship, deleteScholarship,
  updateScholarshipStatus, getUsers
} from '../services/apiClient'
import type { ScholarshipFull, CreateScholarshipRequest, UserInfo, ScholarshipStatus } from '../services/apiClient'

type AdminTab = 'scholarships' | 'users'
type ScholarshipView = 'list' | 'create' | 'edit'
type StatusFilter = 'all' | ScholarshipStatus

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user, profile, signOut } = useAuth()

  const [tab, setTab] = useState<AdminTab>('scholarships')
  const [scholarshipView, setScholarshipView] = useState<ScholarshipView>('list')
  const [scholarships, setScholarships] = useState<ScholarshipFull[]>([])
  const [users, setUsers] = useState<UserInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingScholarship, setEditingScholarship] = useState<ScholarshipFull | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all')

  const fetchScholarships = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getScholarships({}, user.id, 'admin')
      setScholarships(data)
      setError(null)
    } catch {
      setError(t('Failed to load scholarships', 'छात्रवृत्तियां लोड करने में विफल', 'உதவித்தொகைகளை ஏற்ற முடியவில்லை', 'స్కాలర్‌షిప్‌లు లోడ్ చేయడం విఫలమైంది'))
    } finally {
      setLoading(false)
    }
  }, [user, t])

  const fetchUsers = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getUsers(user.id, 'admin')
      setUsers(data.users)
      setError(null)
    } catch {
      setError(t('Failed to load users', 'उपयोगकर्ता लोड करने में विफल', 'பயனர்களை ஏற்ற முடியவில்லை', 'యూజర్లను లోడ్ చేయడం విఫలమైంది'))
    } finally {
      setLoading(false)
    }
  }, [user, t])

  useEffect(() => {
    if (tab === 'scholarships') fetchScholarships()
    else fetchUsers()
  }, [tab, fetchScholarships, fetchUsers])

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const handleCreate = async (data: CreateScholarshipRequest) => {
    if (!user) return
    setActionLoading(true)
    try {
      await createScholarship(
        { ...data, type: 'public', status: 'approved' },
        user.id,
        'admin'
      )
      setScholarshipView('list')
      await fetchScholarships()
    } catch {
      setError(t('Failed to create scholarship', 'छात्रवृत्ति बनाने में विफल', 'உதவித்தொகையை உருவாக்க முடியவில்லை', 'స్కాలర్‌షిప్ సృష్టించడం విఫలమైంది'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdate = async (data: CreateScholarshipRequest) => {
    if (!user || !editingScholarship) return
    setActionLoading(true)
    try {
      await updateScholarship(editingScholarship.id, data, user.id, 'admin')
      setScholarshipView('list')
      setEditingScholarship(null)
      await fetchScholarships()
    } catch {
      setError(t('Failed to update scholarship', 'छात्रवृत्ति अपडेट करने में विफल', 'உதவித்தொகையை புதுப்பிக்க முடியவில்லை', 'స్కాలర్‌షిప్ అప్‌డేట్ చేయడం విఫలమైంది'))
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
      setError(t('Failed to delete scholarship', 'छात्रवृत्ति हटाने में विफल', 'உதவித்தொகையை நீக்க முடியவில்லை', 'స్కాలర్‌షిప్ తొలగించడం విఫలమైంది'))
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
      setError(t('Failed to update status', 'स्थिति अपडेट करने में विफल', 'நிலையை புதுப்பிக்க முடியவில்லை', 'స్టేటస్ అప్‌డేట్ చేయడం విఫలమైంది'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditClick = (scholarship: ScholarshipFull) => {
    setEditingScholarship(scholarship)
    setScholarshipView('edit')
  }

  const handleFormCancel = () => {
    setScholarshipView('list')
    setEditingScholarship(null)
  }

  const totalCount = scholarships.length
  const approvedCount = scholarships.filter(s => s.status === 'approved').length
  const pendingCount = scholarships.filter(s => s.status === 'pending').length
  const publicCount = scholarships.filter(s => s.type === 'public').length
  const privateCount = scholarships.filter(s => s.type === 'private').length

  const filteredScholarships = statusFilter === 'all'
    ? scholarships
    : scholarships.filter(s => s.status === statusFilter)

  const filteredUsers = userRoleFilter === 'all'
    ? users
    : users.filter(u => u.role === userRoleFilter)

  const studentCount = users.filter(u => u.role === 'student').length
  const donorCount = users.filter(u => u.role === 'donor').length
  const adminCount = users.filter(u => u.role === 'admin').length

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-700 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {t('Mission Possible', 'मिशन पॉसिबल', 'மிஷன் பாசிபிள்', 'మిషన్ పాసిబుల్')}
              </h1>
              {profile?.name && (
                <span className="text-xs text-gray-500">{profile.name}</span>
              )}
            </div>
            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
              {t('Admin', 'व्यवस्थापक', 'நிர்வாகி', 'అడ్మిన్')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {t('Logout', 'लॉगआउट', 'வெளியேறு', 'లాగ్అవుట్')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6">
          {/* Error Banner */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
            <button
              onClick={() => { setTab('scholarships'); setScholarshipView('list') }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'scholarships' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
            >
              {t('Scholarships', 'छात्रवृत्तियां', 'உதவித்தொகைகள்', 'స్కాలర్‌షిప్‌లు')}
            </button>
            <button
              onClick={() => setTab('users')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'users' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
            >
              {t('Users', 'उपयोगकर्ता', 'பயனர்கள்', 'యూజర్లు')}
            </button>
          </div>

          {/* Scholarships Tab */}
          {tab === 'scholarships' && (
            <>
              {scholarshipView === 'list' && (
                <>
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {t('All Scholarships', 'सभी छात्रवृत्तियां', 'அனைத்து உதவித்தொகைகள்', 'అన్ని స్కాలర్‌షిప్‌లు')}
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {t('Manage and approve scholarships', 'छात्रवृत्तियां प्रबंधित करें और स्वीकृत करें', 'உதவித்தொகைகளை நிர்வகிக்கவும் மற்றும் ஒப்புக்கொள்ளவும்', 'స్కాలర్‌షిప్‌లను నిర్వహించండి మరియు ఆమోదించండి')}
                      </p>
                    </div>
                    <button
                      onClick={() => setScholarshipView('create')}
                      className="px-4 py-2.5 bg-teal-700 text-white text-sm font-medium rounded-xl hover:bg-teal-800 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      {t('Add Scholarship', 'छात्रवृत्ति जोड़ें', 'உதவித்தொகை சேர்', 'స్కాలర్‌షిప్ జోడించు')}
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                      <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
                      <div className="text-xs text-gray-500">{t('Total', 'कुल', 'மொத்தம்', 'మొత్తం')}</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                      <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                      <div className="text-xs text-gray-500">{t('Approved', 'स्वीकृत', 'அங்கீகரிக்கப்பட்டது', 'ఆమోదించబడింది')}</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                      <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                      <div className="text-xs text-gray-500">{t('Pending', 'लंबित', 'நிலுவையில்', 'పెండింగ్')}</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                      <div className="text-2xl font-bold text-blue-600">{publicCount}</div>
                      <div className="text-xs text-gray-500">{t('Public', 'सार्वजनिक', 'பொது', 'పబ్లిక్')}</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                      <div className="text-2xl font-bold text-purple-600">{privateCount}</div>
                      <div className="text-xs text-gray-500">{t('Donor', 'दानदाता', 'நன்கொடையாளர்', 'దాత')}</div>
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-gray-500 font-medium">{t('Filter:', 'फ़िल्टर:', 'வடிகட்டு:', 'ఫిల్టర్:')}</span>
                    {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setStatusFilter(f)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${statusFilter === f ? 'bg-teal-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {f === 'all' ? t('All', 'सभी', 'அனைத்தும்', 'అన్నీ')
                          : f === 'pending' ? t('Pending', 'लंबित', 'நிலுவையில்', 'పెండింగ్')
                          : f === 'approved' ? t('Approved', 'स्वीकृत', 'அங்கீகரிக்கப்பட்டது', 'ఆమోదించబడింది')
                          : t('Rejected', 'अस्वीकृत', 'நிராகரிக்கப்பட்டது', 'తిరస్కరించబడింది')}
                        {f === 'pending' && pendingCount > 0 && (
                          <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-[10px] bg-yellow-200 text-yellow-800 rounded-full">{pendingCount}</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Loading */}
                  {loading && (
                    <div className="text-center py-12">
                      <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm text-gray-500">{t('Loading...', 'लोड हो रहा है...', 'ஏற்றுகிறது...', 'లోడ్ అవుతోంది...')}</p>
                    </div>
                  )}

                  {/* Empty State */}
                  {!loading && filteredScholarships.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-sm text-gray-500">
                        {statusFilter === 'all'
                          ? t('No scholarships found', 'कोई छात्रवृत्ति नहीं मिली', 'உதவித்தொகைகள் இல்லை', 'స్కాలర్‌షిప్‌లు కనుగొనబడలేదు')
                          : t('No scholarships with this status', 'इस स्थिति वाली कोई छात्रवृत्ति नहीं', 'இந்த நிலையில் உதவித்தொகைகள் இல்லை', 'ఈ స్టేటస్‌తో స్కాలర్‌షిప్‌లు లేవు')}
                      </p>
                    </div>
                  )}

                  {/* Scholarship List */}
                  {!loading && filteredScholarships.length > 0 && (
                    <div className="space-y-3">
                      {filteredScholarships.map(s => (
                        <div key={s.id} className="bg-white rounded-xl p-5 border border-gray-200">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">{s.name}</h3>
                                <StatusBadge status={s.status} t={t} />
                                <TypeBadge type={s.type} t={t} />
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">{s.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                                {s.donorName && (
                                  <span>{t('Donor:', 'दानदाता:', 'நன்கொடையாளர்:', 'దాత:')} {s.donorName}</span>
                                )}
                                {s.deadline && (
                                  <span>{t('Deadline:', 'अंतिम तिथि:', 'கடைசி தேதி:', 'గడువు:')} {s.deadline}</span>
                                )}
                                {s.createdAt && (
                                  <span>{t('Created:', 'निर्मित:', 'உருவாக்கியது:', 'సృష్టించబడింది:')} {new Date(s.createdAt).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              {deletingId === s.id ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-red-600">{t('Delete?', 'हटाएं?', 'நீக்கவா?', 'తొలగించాలా?')}</span>
                                  <button
                                    onClick={() => handleDelete(s.id)}
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
                                  {/* Status Actions for pending scholarships */}
                                  {s.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleStatusChange(s.id, 'approved')}
                                        disabled={actionLoading}
                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                        title={t('Approve', 'स्वीकृत करें', 'அங்கீகரி', 'ఆమోదించు')}
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                      </button>
                                      <button
                                        onClick={() => handleStatusChange(s.id, 'rejected')}
                                        disabled={actionLoading}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                        title={t('Reject', 'अस्वीकृत करें', 'நிராகரி', 'తిరస్కరించు')}
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                      </button>
                                    </>
                                  )}
                                  {/* Re-approve rejected ones */}
                                  {s.status === 'rejected' && (
                                    <button
                                      onClick={() => handleStatusChange(s.id, 'approved')}
                                      disabled={actionLoading}
                                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                      title={t('Approve', 'स्वीकृत करें', 'அங்கீகரி', 'ఆమోదించు')}
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleEditClick(s)}
                                    className="p-2 text-gray-400 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-colors"
                                    title={t('Edit', 'संपादित करें', 'திருத்து', 'సవరించు')}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                  </button>
                                  <button
                                    onClick={() => setDeletingId(s.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                    title={t('Delete', 'हटाएं', 'நீக்கு', 'తొలగించు')}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Create View */}
              {scholarshipView === 'create' && (
                <>
                  <button
                    onClick={handleFormCancel}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    {t('Back to list', 'सूची पर वापस', 'பட்டியலுக்குத் திரும்பு', 'జాబితాకు తిరిగి')}
                  </button>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {t('Add Scholarship', 'छात्रवृत्ति जोड़ें', 'உதவித்தொகை சேர்', 'స్కాలర్‌షిప్ జోడించు')}
                  </h2>
                  <ScholarshipForm
                    onSubmit={handleCreate}
                    onCancel={handleFormCancel}
                    loading={actionLoading}
                  />
                </>
              )}

              {/* Edit View */}
              {scholarshipView === 'edit' && editingScholarship && (
                <>
                  <button
                    onClick={handleFormCancel}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    {t('Back to list', 'सूची पर वापस', 'பட்டியலுக்குத் திரும்பு', 'జాబితాకు తిరిగి')}
                  </button>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {t('Edit Scholarship', 'छात्रवृत्ति संपादित करें', 'உதவித்தொகையைத் திருத்து', 'స్కాలర్‌షిప్ సవరించు')}
                  </h2>
                  <ScholarshipForm
                    initialData={editingScholarship}
                    onSubmit={handleUpdate}
                    onCancel={handleFormCancel}
                    loading={actionLoading}
                  />
                </>
              )}
            </>
          )}

          {/* Users Tab */}
          {tab === 'users' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {t('Users', 'उपयोगकर्ता', 'பயனர்கள்', 'యూజర్లు')}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {t('View all registered users', 'सभी पंजीकृत उपयोगकर्ता देखें', 'அனைத்து பதிவு செய்த பயனர்களையும் காணவும்', 'అన్ని నమోదైన యూజర్లను చూడండి')}
                  </p>
                </div>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-gray-900">{users.length}</div>
                  <div className="text-xs text-gray-500">{t('Total', 'कुल', 'மொத்தம்', 'మొత్తం')}</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-teal-600">{studentCount}</div>
                  <div className="text-xs text-gray-500">{t('Students', 'छात्र', 'மாணவர்கள்', 'విద్యార్థులు')}</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-amber-600">{donorCount}</div>
                  <div className="text-xs text-gray-500">{t('Donors', 'दानदाता', 'நன்கொடையாளர்கள்', 'దాతలు')}</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-purple-600">{adminCount}</div>
                  <div className="text-xs text-gray-500">{t('Admins', 'व्यवस्थापक', 'நிர்வாகிகள்', 'అడ్మిన్లు')}</div>
                </div>
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-gray-500 font-medium">{t('Filter:', 'फ़िल्टर:', 'வடிகட்டு:', 'ఫిల్టర్:')}</span>
                {(['all', 'student', 'donor', 'admin'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setUserRoleFilter(f)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${userRoleFilter === f ? 'bg-teal-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {f === 'all' ? t('All', 'सभी', 'அனைத்தும்', 'அన்నీ')
                      : f === 'student' ? t('Students', 'छात्र', 'மாணவர்கள்', 'విద్యార్థులు')
                      : f === 'donor' ? t('Donors', 'दानदाता', 'நன்கொடையாளர்கள்', 'దాతలు')
                      : t('Admins', 'व्यवस्थापक', 'நிர்வாகிகள்', 'అడ్మిన్లు')}
                  </button>
                ))}
              </div>

              {/* Loading */}
              {loading && (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-500">{t('Loading...', 'लोड हो रहा है...', 'ஏற்றுகிறது...', 'లోడ్ అవుతోంది...')}</p>
                </div>
              )}

              {/* User List */}
              {!loading && filteredUsers.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t('Name', 'नाम', 'பெயர்', 'పేరు')}</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t('Email', 'ईमेल', 'மின்னஞ்சல்', 'ఈమెయిల్')}</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t('Role', 'भूमिका', 'பங்கு', 'పాత్ర')}</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t('Joined', 'शामिल हुए', 'சேர்ந்தது', 'చేరారు')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{u.name || '-'}</td>
                          <td className="px-4 py-3 text-gray-600">{u.email}</td>
                          <td className="px-4 py-3">
                            <RoleBadge role={u.role} t={t} />
                          </td>
                          <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!loading && filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-500">
                    {t('No users found', 'कोई उपयोगकर्ता नहीं मिला', 'பயனர்கள் இல்லை', 'యూజర్లు కనుగొనబడలేదు')}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function StatusBadge({ status, t }: { status: string; t: (en: string, hi?: string, ta?: string, te?: string) => string }) {
  const styles = {
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700'
  }
  const labels = {
    approved: t('Approved', 'स्वीकृत', 'அங்கீகரிக்கப்பட்டது', 'ఆమోదించబడింది'),
    pending: t('Pending', 'लंबित', 'நிலுவையில்', 'పెండింగ్'),
    rejected: t('Rejected', 'अस्वीकृत', 'நிராகரிக்கப்பட்டது', 'తిరస్కరించబడింది')
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-600'}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  )
}

function TypeBadge({ type, t }: { type: string; t: (en: string, hi?: string, ta?: string, te?: string) => string }) {
  const isPublic = type === 'public'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isPublic ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
      {isPublic ? t('Public', 'सार्वजनिक', 'பொது', 'పబ్లిక్') : t('Donor', 'दानदाता', 'நன்கொடையாளர்', 'దాత')}
    </span>
  )
}

function RoleBadge({ role, t }: { role: string; t: (en: string, hi?: string, ta?: string, te?: string) => string }) {
  const styles: Record<string, string> = {
    student: 'bg-teal-100 text-teal-700',
    donor: 'bg-amber-100 text-amber-700',
    admin: 'bg-purple-100 text-purple-700'
  }
  const labels: Record<string, string> = {
    student: t('Student', 'छात्र', 'மாணவர்', 'విద్యార్థి'),
    donor: t('Donor', 'दानदाता', 'நன்கொடையாளர்', 'దాత'),
    admin: t('Admin', 'व्यवस्थापक', 'நிர்வாகி', 'అడ్மிన్')
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[role] || 'bg-gray-100 text-gray-600'}`}>
      {labels[role] || role}
    </span>
  )
}
