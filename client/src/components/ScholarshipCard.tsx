import { useState } from 'react'
import type { ScholarshipResult } from '../services/apiClient'

interface ScholarshipCardProps {
  scholarship: ScholarshipResult
  t: (en: string, hi?: string, ta?: string, te?: string) => string
  matchScore?: number
  matchReasons?: string[]
  index?: number
}

export default function ScholarshipCard({ scholarship, t, matchScore, matchReasons, index }: ScholarshipCardProps) {
  const [expanded, setExpanded] = useState(false)
  const stepsToShow = expanded ? scholarship.applicationSteps : scholarship.applicationSteps.slice(0, 2)
  const hasMore = scholarship.applicationSteps.length > 2

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-[fadeIn_0.3s_ease-out] shadow-sm hover:shadow-md transition-shadow">
      <div className="border-l-4 border-teal-600 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            {index !== undefined && (
              <div className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index}
              </div>
            )}
            <h4 className="font-semibold text-teal-800 text-sm pt-1">{scholarship.name}</h4>
          </div>
          {matchScore !== undefined && (
            <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
              {matchScore}% {t('match', 'मैच', 'பொருத்தம்', 'మ్యాచ్')}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-1">{scholarship.description}</p>

        {matchReasons && matchReasons.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {matchReasons.map((reason, i) => (
              <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-teal-50 text-teal-700">
                {reason}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            {scholarship.benefits}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            {t('Deadline:', 'अंतिम तिथि:', 'காலக்கெடு:', 'గడువు:')} {scholarship.deadline}
          </span>
        </div>

        <div className="mt-3">
          <p className="text-xs font-medium text-gray-700 mb-1">{t('How to Apply:', 'आवेदन कैसे करें:', 'எப்படி விண்ணப்பிப்பது:', 'ఎలా దరఖాస్తు చేయాలి:')}</p>
          <ol className="list-decimal list-inside text-xs text-gray-600 space-y-0.5">
            {stepsToShow.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          {hasMore && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-teal-700 hover:text-teal-900 mt-1"
            >
              {expanded
                ? t('Show less', 'कम दिखाएं', 'குறைவாகக் காட்டு', 'తక్కువ చూపించు')
                : t(`+${scholarship.applicationSteps.length - 2} more steps`, `+${scholarship.applicationSteps.length - 2} और चरण`, `+${scholarship.applicationSteps.length - 2} மேலும் படிகள்`, `+${scholarship.applicationSteps.length - 2} మరిన్ని దశలు`)}
            </button>
          )}
        </div>

        {scholarship.officialUrl && (
          <a
            href={scholarship.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 bg-teal-700 text-white text-xs font-medium rounded-lg hover:bg-teal-800 transition-colors"
          >
            {t('Apply Now', 'अभी आवेदन करें', 'இப்போது விண்ணப்பிக்கவும்', 'ఇప్పుడు దరఖాస్తు చేయండి')}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}
