import { useState } from 'react'
import { sendGuidedFlowStep } from '../services/apiClient'
import type { ScholarshipResult } from '../services/apiClient'
import { useLanguage } from '../context/LanguageContext'
import ScholarshipCard from './ScholarshipCard'

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
      setError(t('Failed to start. Please try again.', 'शुरू करने में विफल। कृपया पुनः प्रयास करें।', 'தொடங்குவதில் தோல்வி. மீண்டும் முயற்சிக்கவும்.', 'ప్రారంభించడంలో విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.'))
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
      setError(t('Something went wrong. Please try again.', 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।', 'ஏதோ தவறு ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.', 'ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.'))
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
              `आपके लिए ${results.length} छात्रवृत्ति मिली`,
              `உங்களுக்கு ${results.length} உதவித்தொகை${results.length !== 1 ? 'கள்' : ''} கிடைத்தது`,
              `మీ కోసం ${results.length} స్కాలర్‌షిప్${results.length !== 1 ? 'లు' : ''} దొరికింది`
            )}
          </h3>
          {results.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm mb-3">
                {t(
                  'No matching scholarships found. Try the free chat for a broader search.',
                  'कोई मिलती-जुलती छात्रवृत्ति नहीं मिली। व्यापक खोज के लिए फ्री चैट आज़माएं।',
                  'பொருந்தும் உதவித்தொகைகள் எதுவும் கிடைக்கவில்லை. பரந்த தேடலுக்கு சாட் முயற்சிக்கவும்.',
                  'సరిపోలిన స్కాలర్‌షిప్‌లు కనుగొనబడలేదు. విస్తృత శోధన కోసం చాట్ ప్రయత్నించండి.'
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
            className="w-full py-2.5 bg-teal-700 text-white text-sm font-medium rounded-xl hover:bg-teal-800 transition-colors"
          >
            {t('Start Over', 'फिर से शुरू करें', 'மீண்டும் தொடங்கு', 'మళ్ళీ ప్రారంభించు')}
          </button>
        </div>
      </div>
    )
  }

  // Start screen
  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {t('Guided Scholarship Search', 'निर्देशित छात्रवृत्ति खोज', 'வழிகாட்டப்பட்ட உதவித்தொகை தேடல்', 'మార్గదర్శక స్కాలర్‌షిప్ శోధన')}
        </h3>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">
          {t(
            "Answer a few questions about yourself and we'll find scholarships you're eligible for.",
            'अपने बारे में कुछ सवालों के जवाब दें और हम आपके लिए योग्य छात्रवृत्ति खोजेंगे।',
            'உங்களைப் பற்றிய சில கேள்விகளுக்கு பதிலளியுங்கள், நீங்கள் தகுதியான உதவித்தொகைகளை நாங்கள் கண்டறிவோம்.',
            'మీ గురించి కొన్ని ప్రశ్నలకు సమాధానం ఇవ్వండి, మీకు అర్హమైన స్కాలర్‌షిప్‌లను మేము కనుగొంటాము.'
          )}
        </p>
        <button
          onClick={startFlow}
          disabled={loading}
          className="px-6 py-2.5 bg-teal-700 text-white text-sm font-medium rounded-xl hover:bg-teal-800 disabled:opacity-50 transition-colors"
        >
          {loading ? t('Loading...', 'लोड हो रहा...', 'ஏற்றுகிறது...', 'లోడ్ అవుతోంది...') : t('Start', 'शुरू करें', 'தொடங்கு', 'ప్రారంభించు')}
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
              <span>{t('Step', 'चरण', 'படி', 'దశ')} {currentStep.stepIndex + 1}/{currentStep.totalSteps}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-teal-700 h-1.5 rounded-full transition-all duration-300"
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
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-teal-500 hover:bg-teal-50 disabled:opacity-50 transition-colors"
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
            <div className="w-6 h-6 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-3">
        <button
          onClick={reset}
          className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {t('Cancel', 'रद्द करें', 'ரத்துசெய்', 'రద్దు చేయి')}
        </button>
      </div>
    </div>
  )
}
