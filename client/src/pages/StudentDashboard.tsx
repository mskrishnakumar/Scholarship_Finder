import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatWindow from '../components/ChatWindow'
import GuidedFlow from '../components/GuidedFlow'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'

type Tab = 'chat' | 'guided'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('guided')

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {t('Scholarship Finder', 'छात्रवृत्ति खोजक', 'உதவித்தொகை கண்டுபிடிப்பான்', 'స్కాలర్‌షిప్ ఫైండర్')}
              </h1>
              {profile?.name && (
                <span className="text-xs text-gray-500">
                  {t(`Hi, ${profile.name}`, `नमस्ते, ${profile.name}`, `வணக்கம், ${profile.name}`, `హాయ్, ${profile.name}`)}
                </span>
              )}
            </div>
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

      {/* Tab switcher */}
      <div className="bg-white border-b border-gray-200 px-4 shrink-0">
        <div className="max-w-4xl mx-auto flex">
          <button
            onClick={() => setActiveTab('guided')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'guided'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('Guided Search', 'निर्देशित खोज', 'வழிகாட்டப்பட்ட தேடல்', 'మార్గదర్శక శోధన')}
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'chat'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('Chat', 'चैट', 'அரட்டை', 'చాట్')}
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full">
          <div className="h-full bg-white md:border-x border-gray-200">
            {activeTab === 'chat' ? <ChatWindow /> : <GuidedFlow />}
          </div>
        </div>
      </main>
    </div>
  )
}
