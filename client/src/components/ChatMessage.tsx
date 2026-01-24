import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { translateText } from '../services/apiClient'

const TRANSLATE_LANGUAGES = [
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
]

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user'
  const { profile } = useAuth()
  const { t } = useLanguage()

  const [translatedContent, setTranslatedContent] = useState<string | null>(null)
  const [translating, setTranslating] = useState(false)
  const [showTranslation, setShowTranslation] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [translatedTo, setTranslatedTo] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const userInitial = profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  const handleTranslate = async (langCode: string) => {
    setDropdownOpen(false)

    // If already translated to this language, toggle visibility
    if (translatedTo === langCode && translatedContent) {
      setShowTranslation(!showTranslation)
      return
    }

    setTranslating(true)
    try {
      const res = await translateText(content, langCode)
      setTranslatedContent(res.translatedText)
      setTranslatedTo(langCode)
      setShowTranslation(true)
    } catch {
      // Silently fail - button stays available for retry
    } finally {
      setTranslating(false)
    }
  }

  const displayContent = showTranslation && translatedContent ? translatedContent : content

  const currentLangLabel = translatedTo
    ? TRANSLATE_LANGUAGES.find(l => l.code === translatedTo)?.native
    : null

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 animate-[fadeIn_0.3s_ease-out]`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center mr-2 mt-1 shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
      )}
      <div className="max-w-[80%]">
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'bg-indigo-600 text-white rounded-br-md whitespace-pre-wrap'
              : 'bg-gray-100 text-gray-800 rounded-bl-md'
          }`}
        >
          {isUser ? (
            content
          ) : (
            <ReactMarkdown
              components={{
                h3: ({ children }) => <h3 className="font-semibold text-base mt-3 mb-1">{children}</h3>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc pl-4 my-1 space-y-0.5">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 my-1 space-y-0.5">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                p: ({ children }) => <p className="my-1.5">{children}</p>,
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline hover:text-indigo-800">
                    {children}
                  </a>
                ),
                hr: () => <hr className="my-2 border-gray-300" />,
              }}
            >
              {displayContent}
            </ReactMarkdown>
          )}
        </div>
        {/* Translate dropdown for bot messages */}
        {!isUser && (
          <div className="relative mt-1.5 ml-1" ref={dropdownRef}>
            {translating ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg">
                <span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                {t('Translating...', 'अनुवाद हो रहा है...', 'மொழிபெயர்க்கிறது...', 'అనువదిస్తోంది...')}
              </span>
            ) : showTranslation ? (
              <button
                onClick={() => setShowTranslation(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                {t('Show Original', 'मूल दिखाएं', 'அசலைக் காட்டு', 'అసలు చూపించు')} ({currentLangLabel})
              </button>
            ) : (
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                {t('Translate', 'अनुवाद करें', 'மொழிபெயர்', 'అనువదించు')}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 animate-[fadeIn_0.15s_ease-out]">
                {TRANSLATE_LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => handleTranslate(lang.code)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center justify-between"
                  >
                    <span>{lang.label}</span>
                    <span className="text-xs text-gray-400">{lang.native}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center ml-2 mt-1 shrink-0">
          <span className="text-xs font-bold text-indigo-700">{userInitial}</span>
        </div>
      )}
    </div>
  )
}
