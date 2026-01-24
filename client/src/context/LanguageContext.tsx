import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export type Language = 'en' | 'hi' | 'ta' | 'te'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (en: string, hi?: string, ta?: string, te?: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  const t = (en: string, hi?: string, ta?: string, te?: string): string => {
    switch (language) {
      case 'hi': return hi || en
      case 'ta': return ta || en
      case 'te': return te || en
      default: return en
    }
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
