import { useState } from 'react'
import { sendGuidedFlowStep } from '../services/apiClient'
import type { ScholarshipResult } from '../services/apiClient'
import { useLanguage } from '../context/LanguageContext'

function ScholarshipCard({ scholarship, t }: { scholarship: ScholarshipResult; t: (en: string, hi: string) => string }) {
  const [expanded, setExpanded] = useState(false)
  const stepsToShow = expanded ? scholarship.applicationSteps : scholarship.applicationSteps.slice(0, 2)
  const hasMore = scholarship.applicationSteps.length > 2

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden animate-[fadeIn_0.3s_ease-out]">
      <div className="border-l-4 border-indigo-500 p-4">
        <h4 className="font-semibold text-indigo-700 text-sm">{scholarship.name}</h4>
        <p className="text-xs text-gray-600 mt-1">{scholarship.description}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            {scholarship.benefits}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            {t('Deadline:', 'अंतिम तिथि:')} {scholarship.deadline}
          </span>
        </div>

        <div className="mt-3">
          <p className="text-xs font-medium text-gray-700 mb-1">{t('How to Apply:', 'आवेदन कैसे करें:')}</p>
          <ol className="list-decimal list-inside text-xs text-gray-600 space-y-0.5">
            {stepsToShow.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          {hasMore && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-indigo-600 hover:text-indigo-800 mt-1"
            >
              {expanded
                ? t('Show less', 'कम दिखाएं')
                : t(`+${scholarship.applicationSteps.length - 2} more steps`, `+${scholarship.applicationSteps.length - 2} और चरण`)}
            </button>
          )}
        </div>

        {scholarship.officialUrl && (
          <a
            href={scholarship.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {t('Apply Now', 'अभी आवेदन करें')}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}

interface StepData {
  step: string
  stepIndex: number
  totalSteps: number
  question: string
  options: Array<{ value: string; label: string }>
}

export default function GuidedFlow() {
  const { language, t } = useLanguage()
  const [currentStep, setCurrentStep] = useState<StepData | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [results, setResults] = useState<ScholarshipResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startFlow = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await sendGuidedFlowStep('start', {}, language)
      setCurrentStep({
        step: res.step!,
        stepIndex: res.stepIndex!,
        totalSteps: res.totalSteps!,
        question: res.question!,
        options: res.options!
      })
      setStarted(true)
    } catch {
      setError(t('Failed to start. Please try again.', 'शुरू करने में विफल। कृपया पुनः प्रयास करें।'))
    } finally {
      setLoading(false)
    }
  }

  const selectOption = async (value: string) => {
    if (!currentStep || loading) return

    const newAnswers = { ...answers, [currentStep.step]: value }
    setAnswers(newAnswers)
    setLoading(true)
    setError(null)

    try {
      const res = await sendGuidedFlowStep(currentStep.step, newAnswers, language)

      if (res.step === 'results') {
        setResults(res.results || [])
        setCurrentStep(null)
      } else {
        setCurrentStep({
          step: res.step!,
          stepIndex: res.stepIndex!,
          totalSteps: res.totalSteps!,
          question: res.question!,
          options: res.options!
        })
      }
    } catch {
      setError(t('Something went wrong. Please try again.', 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।'))
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setCurrentStep(null)
    setAnswers({})
    setResults(null)
    setStarted(false)
    setError(null)
  }

  // Results view
  if (results !== null) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            {t(
              `Found ${results.length} scholarship${results.length !== 1 ? 's' : ''} for you`,
              `आपके लिए ${results.length} छात्रवृत्ति मिली`
            )}
          </h3>
          {results.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm mb-3">
                {t(
                  'No matching scholarships found. Try the free chat for a broader search.',
                  'कोई मिलती-जुलती छात्रवृत्ति नहीं मिली। व्यापक खोज के लिए फ्री चैट आज़माएं।'
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map(s => (
                <ScholarshipCard key={s.id} scholarship={s} t={t} />
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={reset}
            className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
          >
            {t('Start Over', 'फिर से शुरू करें')}
          </button>
        </div>
      </div>
    )
  }

  // Start screen
  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {t('Guided Scholarship Search', 'निर्देशित छात्रवृत्ति खोज')}
        </h3>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">
          {t(
            "Answer a few questions about yourself and we'll find scholarships you're eligible for.",
            'अपने बारे में कुछ सवालों के जवाब दें और हम आपके लिए योग्य छात्रवृत्ति खोजेंगे।'
          )}
        </p>
        <button
          onClick={startFlow}
          disabled={loading}
          className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? t('Loading...', 'लोड हो रहा...') : t('Start', 'शुरू करें')}
        </button>
      </div>
    )
  }

  // Question step
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {/* Progress bar */}
        {currentStep && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{t('Step', 'चरण')} {currentStep.stepIndex + 1}/{currentStep.totalSteps}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep.stepIndex + 1) / currentStep.totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        {currentStep && (
          <>
            <h3 className="text-base font-medium text-gray-800 mb-4">
              {currentStep.question}
            </h3>
            <div className="grid gap-2">
              {currentStep.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => selectOption(opt.value)}
                  disabled={loading}
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 disabled:opacity-50 transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        )}

        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}

        {loading && !currentStep && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-3">
        <button
          onClick={reset}
          className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {t('Cancel', 'रद्द करें')}
        </button>
      </div>
    </div>
  )
}
