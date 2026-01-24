import { useState, useRef, useEffect } from 'react'
import ChatMessage from './ChatMessage'
import SuggestionChips from './SuggestionChips'
import { sendChatMessage } from '../services/apiClient'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function ChatWindow() {
  const { language, t } = useLanguage()
  const { user, profile } = useAuth()

  const welcomeMessage: Message = {
    id: 'welcome',
    role: 'assistant',
    content: profile?.name
      ? t(
          `Hi ${profile.name}! I'm ready to help you find scholarships${profile.state ? ` in ${profile.state}` : ''}. Ask me anything — like "scholarships for SC students" or "post-matric schemes"!`,
          `नमस्ते ${profile.name}! मैं आपको छात्रवृत्ति खोजने में मदद के लिए तैयार हूं${profile.state ? ` ${profile.state} में` : ''}। कुछ भी पूछें — जैसे "SC छात्रों के लिए छात्रवृत्ति" या "पोस्ट-मैट्रिक योजनाएं"!`,
          `வணக்கம் ${profile.name}! உதவித்தொகைகளைக் கண்டறிய நான் தயாராக இருக்கிறேன்${profile.state ? ` ${profile.state} இல்` : ''}. எதையும் கேளுங்கள்!`,
          `హాయ్ ${profile.name}! స్కాలర్‌షిప్‌లను కనుగొనడంలో సహాయం చేయడానికి నేను సిద్ధంగా ఉన్నాను${profile.state ? ` ${profile.state} లో` : ''}. ఏదైనా అడగండి!`
        )
      : t(
          'Hello! I can help you find scholarships. Ask me anything!',
          'नमस्ते! मैं आपको छात्रवृत्ति खोजने में मदद कर सकता हूं। कुछ भी पूछें!',
          'வணக்கம்! உதவித்தொகைகளைக் கண்டறிய நான் உதவ முடியும். எதையும் கேளுங்கள்!',
          'హలో! స్కాలర్‌షిప్‌లను కనుగొనడంలో నేను మీకు సహాయం చేయగలను. ఏదైనా అడగండి!'
        )
  }

  const [messages, setMessages] = useState<Message[]>([welcomeMessage])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const [showChips, setShowChips] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (textOverride?: string) => {
    const text = (textOverride || input).trim()
    if (!text || loading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    if (!textOverride) setInput('')

    setShowChips(false)
    setLoading(true)

    try {
      const res = await sendChatMessage(
        text,
        conversationId,
        language,
        user?.id,
        profile?.state
      )
      setConversationId(res.conversationId)
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.message
      }
      setMessages(prev => [...prev, botMsg])
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t(
          'Sorry, something went wrong. Please try again.',
          'क्षमा करें, कुछ गलत हो गया। कृपया पुनः प्रयास करें।',
          'மன்னிக்கவும், ஏதோ தவறு ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.',
          'క్షమించండి, ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.'
        )
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChipClick = (text: string) => {
    handleSend(text)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map(msg => (
          <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
        ))}
        {showChips && (
          <SuggestionChips
            studentState={profile?.state}
            language={language}
            onChipClick={handleChipClick}
          />
        )}
        {loading && (
          <div className="flex justify-start mb-3">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-gray-400">{t('Thinking...', 'सोच रहा हूं...', 'யோசிக்கிறது...', 'ఆలోచిస్తోంది...')}</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex gap-2">
          <textarea
            className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={1}
            placeholder={t('Ask about scholarships...', 'छात्रवृत्ति के बारे में पूछें...', 'உதவித்தொகைகளைப் பற்றி கேளுங்கள்...', 'స్కాలర్‌షిప్‌ల గురించి అడగండి...')}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('Send', 'भेजें', 'அனுப்பு', 'పంపు')}
          </button>
        </div>
      </div>
    </div>
  )
}
