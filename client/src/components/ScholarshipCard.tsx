import { useState } from 'react'
import type { ScholarshipResult } from '../services/apiClient'
import {
  getDaysUntilDeadline,
  formatDeadlineDisplay,
  getDeadlineBadgeClasses
} from '../utils/deadlineUtils'

interface ScholarshipCardProps {
  scholarship: ScholarshipResult & { type?: 'public' | 'private' }
  t: (en: string, hi?: string, ta?: string, te?: string) => string
  matchScore?: number
  matchReasons?: string[]
  index?: number
  showSemanticScore?: boolean
  eligibilityScore?: number
  semanticScore?: number
  isSemanticSuggestion?: boolean
  isSaved?: boolean
  onSave?: (scholarship: ScholarshipResult & { type?: 'public' | 'private' }) => void
  onUnsave?: (id: string) => void
}

export default function ScholarshipCard({
  scholarship,
  t,
  matchScore,
  matchReasons,
  showSemanticScore,
  eligibilityScore,
  semanticScore,
  isSemanticSuggestion,
  isSaved = false,
  onSave,
  onUnsave
}: ScholarshipCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [savePending, setSavePending] = useState(false)

  const daysUntilDeadline = getDaysUntilDeadline(scholarship.deadline)
  const deadlineDisplay = formatDeadlineDisplay(scholarship.deadline, t)
  const deadlineBadgeClasses = getDeadlineBadgeClasses(scholarship.deadline)

  // Determine border and badge colors based on type
  const isGovernment = scholarship.type === 'public'
  const borderColor = isSemanticSuggestion ? 'border-indigo-500' : 'border-teal-600'
  const matchBadgeBgColor = isSemanticSuggestion ? 'bg-indigo-100 text-indigo-800' : 'bg-teal-100 text-teal-800'
  const typeBadge = isGovernment
    ? { bg: 'bg-blue-100', text: 'text-blue-700', label: t('Govt', 'सरकारी', 'அரசு', 'ప్రభుత్వ') }
    : { bg: 'bg-amber-100', text: 'text-amber-700', label: t('Private', 'प्राइवेट', 'தனியார்', 'ప్రైవేట్') }

  const handleSaveClick = async () => {
    if (savePending) return
    setSavePending(true)
    try {
      if (isSaved && onUnsave) {
        await onUnsave(scholarship.id)
      } else if (onSave) {
        await onSave(scholarship)
      }
    } finally {
      setSavePending(false)
    }
  }

  return (
    <div className={`bg-white border border-gray-200 ${isSemanticSuggestion ? 'rounded-b-xl' : 'rounded-xl'} overflow-hidden animate-[fadeIn_0.3s_ease-out] shadow-sm hover:shadow-md transition-shadow`}>
      <div className={`border-l-4 ${borderColor} p-4`}>
        {/* Header Row: Type Badge, Name, Match Score */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${typeBadge.bg} ${typeBadge.text}`}>
              {typeBadge.label}
            </span>
            <h4 className="font-semibold text-gray-900 text-sm leading-tight">{scholarship.name}</h4>
          </div>
          {matchScore !== undefined && (
            <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${matchBadgeBgColor}`}>
              {matchScore}%
            </span>
          )}
        </div>

        {/* Key Metrics Row: Benefit, Deadline, Match Reason */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {/* Benefit Amount */}
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            {scholarship.benefits}
          </span>

          {/* Deadline with urgency indicator */}
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${deadlineBadgeClasses}`}>
            {daysUntilDeadline >= 0 && daysUntilDeadline <= 7 && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            )}
            {deadlineDisplay}
          </span>

          {/* First match reason as a quick insight */}
          {matchReasons && matchReasons.length > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-teal-50 text-teal-700">
              {matchReasons[0]}
            </span>
          )}
        </div>

        {/* Score breakdown for semantic matching */}
        {showSemanticScore && (eligibilityScore !== undefined || semanticScore !== undefined) && (
          <div className="mt-2 flex gap-1.5 text-xs">
            {eligibilityScore !== undefined && (
              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600" title="Eligibility score">
                E:{eligibilityScore}
              </span>
            )}
            {semanticScore !== undefined && (
              <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-600" title="Semantic similarity">
                S:{semanticScore}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="mt-4 flex items-center gap-2">
          {/* Save Button */}
          {(onSave || onUnsave) && (
            <button
              onClick={handleSaveClick}
              disabled={savePending}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isSaved
                  ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              {savePending ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : isSaved ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
              {isSaved ? t('Saved', 'सहेजा गया', 'சேமிக்கப்பட்டது', 'సేవ్ చేయబడింది') : t('Save', 'सहेजें', 'சேமி', 'సేవ్')}
            </button>
          )}

          {/* Apply Now Button */}
          {scholarship.officialUrl && (
            <a
              href={scholarship.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-teal-700 text-white text-sm font-medium rounded-lg hover:bg-teal-800 transition-colors"
            >
              {t('Apply Now', 'अभी आवेदन करें', 'இப்போது விண்ணப்பிக்கவும்', 'ఇప్పుడు దరఖాస్తు చేయండి')}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}

          {/* Details Toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
          >
            {expanded ? t('Hide', 'छुपाएं', 'மறை', 'దాచు') : t('Details', 'विवरण', 'விவரங்கள்', 'వివరాలు')}
            <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Expandable Details Section */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-[fadeIn_0.2s_ease-out]">
            {/* Description */}
            <div>
              <p className="text-sm text-gray-600">{scholarship.description}</p>
            </div>

            {/* All Match Reasons */}
            {matchReasons && matchReasons.length > 1 && (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1.5">
                  {t('Why you match:', 'आप क्यों मैच करते हैं:', 'நீங்கள் ஏன் பொருந்துகிறீர்கள்:', 'మీరు ఎందుకు సరిపోతారు:')}
                </p>
                <div className="flex flex-wrap gap-1">
                  {matchReasons.map((reason, i) => (
                    <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-teal-50 text-teal-700">
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Application Steps */}
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1.5">
                {t('How to Apply:', 'आवेदन कैसे करें:', 'எப்படி விண்ணப்பிப்பது:', 'ఎలా దరఖాస్తు చేయాలి:')}
              </p>
              <ol className="list-decimal list-inside text-xs text-gray-600 space-y-0.5">
                {scholarship.applicationSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>

            {/* Required Documents */}
            {scholarship.requiredDocuments && scholarship.requiredDocuments.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1.5">
                  {t('Required Documents:', 'आवश्यक दस्तावेज़:', 'தேவையான ஆவணங்கள்:', 'అవసరమైన పత్రాలు:')}
                </p>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                  {scholarship.requiredDocuments.map((doc, i) => (
                    <li key={i}>{doc}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Deadline */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{t('Deadline:', 'अंतिम तिथि:', 'காலக்கெடு:', 'గడువు:')} {scholarship.deadline}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
