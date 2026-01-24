import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatWindow from '../components/ChatWindow'
import GuidedFlow from '../components/GuidedFlow'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../context/LanguageContext'

type Tab = 'chat' | 'guided'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<Tab>('chat')

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">
              {t('Scholarship Finder', 'छात्रवृत्ति खोजक')}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {t('Logout', 'लॉगआउट')}
            </button>
          </div>
        </div>
      </header>

      {/* Tab switcher */}
      <div className="bg-white border-b border-gray-200 px-4 shrink-0">
        <div className="max-w-4xl mx-auto flex">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'chat'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('Chat', 'चैट')}
          </button>
          <button
            onClick={() => setActiveTab('guided')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'guided'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('Guided Search', 'निर्देशित खोज')}
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
