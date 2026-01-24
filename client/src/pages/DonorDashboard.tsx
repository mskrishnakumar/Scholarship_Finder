import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import LanguageToggle from '../components/LanguageToggle'
import ScholarshipForm from '../components/ScholarshipForm'
import {
  getScholarships, createScholarship, updateScholarship, deleteScholarship
} from '../services/apiClient'
import type { ScholarshipFull, CreateScholarshipRequest } from '../services/apiClient'

type DashboardView = 'list' | 'create' | 'edit'

export default function DonorDashboard() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user, profile, signOut } = useAuth()

  const [view, setView] = useState<DashboardView>('list')
  const [scholarships, setScholarships] = useState<ScholarshipFull[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingScholarship, setEditingScholarship] = useState<ScholarshipFull | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchScholarships = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getScholarships({ donorId: user.id }, user.id, 'donor')
      setScholarships(data)
      setError(null)
    } catch {
      setError(t('Failed to load scholarships', 'छात्रवृत्तियां लोड करने में विफल', 'உதவித்தொகைகளை ஏற்ற முடியவில்லை', 'స్కాలర్‌షిప్‌లు లోడ్ చేయడం విఫలమైంది'))
    } finally {
      setLoading(false)
    }
  }, [user, t])

  useEffect(() => { fetchScholarships() }, [fetchScholarships])

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const handleCreate = async (data: CreateScholarshipRequest) => {
    if (!user) return
    setActionLoading(true)
    try {
      await createScholarship(
        { ...data, donorName: profile?.name || '' },
        user.id,
        'donor'
      )
      setView('list')
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
      await updateScholarship(editingScholarship.id, data, user.id, 'donor')
      setView('list')
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
      await deleteScholarship(id, user.id, 'donor')
      setDeletingId(null)
      await fetchScholarships()
    } catch {
      setError(t('Failed to delete scholarship', 'छात्रवृत्ति हटाने में विफल', 'உதவித்தொகையை நீக்க முடியவில்லை', 'స్కాలర్‌షిప్ తొలగించడం విఫలమైంది'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditClick = (scholarship: ScholarshipFull) => {
    setEditingScholarship(scholarship)
    setView('edit')
  }

  const handleFormCancel = () => {
    setView('list')
    setEditingScholarship(null)
  }

  const approvedCount = scholarships.filter(s => s.status === 'approved').length
  const pendingCount = scholarships.filter(s => s.status === 'pending').length
  const rejectedCount = scholarships.filter(s => s.status === 'rejected').length

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              {t('Donor', 'दानदाता', 'நன்கொடையாளர்', 'దాత')}
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
        <div className="max-w-4xl mx-auto p-6">
          {/* Error Banner */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}

          {/* List View */}
          {view === 'list' && (
            <>
              {/* Header Row */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {t('My Scholarships', 'मेरी छात्रवृत्तियां', 'எனது உதவித்தொகைகள்', 'నా స్కాలర్‌షిప్‌లు')}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {t('Manage your scholarships and track their status', 'अपनी छात्रवृत्तियां प्रबंधित करें', 'உங்கள் உதவித்தொகைகளை நிர்வகிக்கவும்', 'మీ స్కాలర్‌షిప్‌లను నిర్వహించండి')}
                  </p>
                </div>
                <button
                  onClick={() => setView('create')}
                  className="px-4 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-xl hover:bg-amber-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  {t('Create', 'बनाएं', 'உருவாக்கு', 'సృష్టించు')}
                </button>
              </div>

              {/* Stats */}
              {scholarships.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-gray-900">{scholarships.length}</div>
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
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-500">{t('Loading...', 'लोड हो रहा है...', 'ஏற்றுகிறது...', 'లోడ్ అవుతోంది...')}</p>
                </div>
              )}

              {/* Empty State */}
              {!loading && scholarships.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {t('No scholarships yet', 'अभी तक कोई छात्रवृत्ति नहीं', 'இன்னும் உதவித்தொகைகள் இல்லை', 'ఇంకా స్కాలర్‌షిప్‌లు లేవు')}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    {t('Create your first scholarship to help students', 'छात्रों की मदद के लिए अपनी पहली छात्रवृत्ति बनाएं', 'மாணவர்களுக்கு உதவ உங்கள் முதல் உதவித்தொகையை உருவாக்குங்கள்', 'విద్యార్థులకు సహాయం చేయడానికి మీ మొదటి స్కాలర్‌షిప్‌ను సృష్టించండి')}
                  </p>
                  <button
                    onClick={() => setView('create')}
                    className="px-6 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-xl hover:bg-amber-700 transition-colors"
                  >
                    {t('Create Scholarship', 'छात्रवृत्ति बनाएं', 'உதவித்தொகையை உருவாக்கு', 'స్కాలర్‌షిప్ సృష్టించు')}
                  </button>
                </div>
              )}

              {/* Scholarship List */}
              {!loading && scholarships.length > 0 && (
                <div className="space-y-3">
                  {scholarships.map(s => (
                    <div key={s.id} className="bg-white rounded-xl p-5 border border-gray-200">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">{s.name}</h3>
                            <StatusBadge status={s.status} t={t} />
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{s.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            {s.deadline && (
                              <span>{t('Deadline:', 'अंतिम तिथि:', 'கடைசி தேதி:', 'గడువు:')} {s.deadline}</span>
                            )}
                            {s.createdAt && (
                              <span>{t('Created:', 'निर्मित:', 'உருவாக்கியது:', 'సృష్టించబడింది:')} {new Date(s.createdAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {deletingId === s.id ? (
                          <div className="flex items-center gap-2 shrink-0">
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
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleEditClick(s)}
                              className="p-2 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
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
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Create View */}
          {view === 'create' && (
            <>
              <button
                onClick={handleFormCancel}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                {t('Back to list', 'सूची पर वापस', 'பட்டியலுக்குத் திரும்பு', 'జాబితాకు తిరిగి')}
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {t('Create Scholarship', 'छात्रवृत्ति बनाएं', 'உதவித்தொகையை உருவாக்கு', 'స్కాలర్‌షిప్ సృష్టించు')}
              </h2>
              <ScholarshipForm
                onSubmit={handleCreate}
                onCancel={handleFormCancel}
                loading={actionLoading}
              />
            </>
          )}

          {/* Edit View */}
          {view === 'edit' && editingScholarship && (
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
