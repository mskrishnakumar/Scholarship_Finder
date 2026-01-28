import { useState } from 'react'
import type { ScholarshipResult } from '../services/apiClient'
import {
  getDaysUntilDeadline,
  formatDeadlineDisplay
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
  isEligible?: boolean
  ineligibilityReasons?: string[]
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
  onUnsave,
  isEligible = true,
  ineligibilityReasons
}: ScholarshipCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [savePending, setSavePending] = useState(false)

  const daysUntilDeadline = getDaysUntilDeadline(scholarship.deadline)
  const deadlineDisplay = formatDeadlineDisplay(scholarship.deadline, t)

  // Determine border and badge colors - subtle, muted tones
  const isGovernment = scholarship.type === 'public'
  const typeBadge = isGovernment
    ? { bg: 'bg-gray-100', text: 'text-gray-600', label: t('Govt', 'सरकारी', 'அரசு', 'ప్రభుత్వ') }
    : { bg: 'bg-gray-100', text: 'text-gray-600', label: t('Private', 'प्राइवेट', 'தனியார்', 'ప్రైవేట్') }

  // Border color
  const borderColor = !isEligible
    ? 'border-gray-300'
    : isSemanticSuggestion
      ? 'border-gray-400'
      : matchScore && matchScore >= 70
        ? 'border-emerald-300'
        : 'border-gray-200'

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
    <div className={`bg-white border ${borderColor} ${isSemanticSuggestion ? 'rounded-b-lg' : 'rounded-lg'} overflow-hidden transition-all hover:shadow-sm ${!isEligible ? 'opacity-60' : ''}`}>
      <div className={`border-l-3 ${!isEligible ? 'border-gray-300' : borderColor} px-3 py-2.5`}>
        {/* Header Row: Type Badge, Name, Match Score or Not Eligible */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-1.5 flex-1 min-w-0">
            <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${typeBadge.bg} ${typeBadge.text}`}>
              {typeBadge.label}
            </span>
            <h4 className={`font-medium text-xs leading-tight ${!isEligible ? 'text-gray-500' : 'text-gray-800'}`}>{scholarship.name}</h4>
          </div>
          {!isEligible ? (
            <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-600">
              {t('Ineligible', 'अयोग्य', 'தகுதியற்ற', 'అనర్హ')}
            </span>
          ) : matchScore !== undefined && (
            <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              matchScore >= 70 ? 'bg-emerald-50 text-emerald-700' :
              matchScore >= 50 ? 'bg-blue-50 text-blue-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {matchScore}%
            </span>
          )}
        </div>

        
        {/* Key Metrics Row: Benefit + Deadline */}
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={`font-semibold ${!isEligible ? 'text-gray-400' : 'text-teal-600'}`}>
            {scholarship.benefits}
          </span>
          <span className={`flex items-center gap-0.5 text-[10px] ${
            daysUntilDeadline >= 0 && daysUntilDeadline <= 7
              ? 'text-red-500 font-medium'
              : 'text-gray-500'
          }`}>
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {deadlineDisplay}
          </span>
        </div>

        {/* Action Buttons Row */}
        <div className="mt-2 flex items-center gap-1.5">
          {/* Save Button */}
          {(onSave || onUnsave) && (
            <button
              onClick={handleSaveClick}
              disabled={savePending}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors border ${
                isSaved
                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              {savePending ? (
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 20 20" stroke="currentColor">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              )}
              {isSaved ? t('Saved', 'सहेजा', 'சேமித்தது', 'సేవ్') : t('Save', 'सहेजें', 'சேமி', 'సేవ్')}
            </button>
          )}

          {/* Apply Now Button */}
          {scholarship.officialUrl && (
            <a
              href={scholarship.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 bg-teal-600 text-white text-[10px] font-medium rounded hover:bg-teal-700 transition-colors"
            >
              {t('Apply', 'आवेदन', 'விண்ணப்பி', 'దరఖాస్తు')}
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          )}

          {/* Details Toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-0.5 px-2 py-1 text-[10px] text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors ml-auto"
          >
            {expanded ? t('Hide', 'छुपाएं', 'மறை', 'దాచు') : t('More', 'अधिक', 'மேலும்', 'మరింత')}
            <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Expandable Details Section */}
        {expanded && (
          <div className="mt-2 pt-2 border-t border-gray-100 space-y-2 text-[11px]">
            <p className="text-gray-600">{scholarship.description}</p>

            {matchReasons && matchReasons.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {matchReasons.map((reason, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                    {reason}
                  </span>
                ))}
              </div>
            )}

            <div>
              <p className="font-medium text-gray-700 mb-1">{t('Steps:', 'चरण:', 'படிகள்:', 'దశలు:')}</p>
              <ol className="list-decimal list-inside text-gray-600 space-y-0.5">
                {scholarship.applicationSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
