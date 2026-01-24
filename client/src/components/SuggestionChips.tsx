import type { StudentProfileData } from '../services/apiClient'

interface SuggestionChipsProps {
  studentProfile?: StudentProfileData
  language: string
  onChipClick: (text: string) => void
}

export default function SuggestionChips({ studentProfile, language, onChipClick }: SuggestionChipsProps) {
  const chips: string[] = []

  if (language === 'hi') {
    if (studentProfile?.category) {
      chips.push(`${studentProfile.category} छात्रों के लिए छात्रवृत्ति`)
    } else {
      chips.push('SC छात्रों के लिए छात्रवृत्ति')
    }
    chips.push('पोस्ट-मैट्रिक योजनाएं')
    if (studentProfile?.course) {
      chips.push(`${studentProfile.course} छात्रवृत्ति`)
    } else {
      chips.push('बिना आय सीमा वाली छात्रवृत्ति')
    }
    if (studentProfile?.state) {
      chips.push(`${studentProfile.state} की छात्रवृत्ति`)
    }
  } else {
    if (studentProfile?.category) {
      chips.push(`Scholarships for ${studentProfile.category} students`)
    } else {
      chips.push('Scholarships for SC students')
    }
    chips.push('Post-matric schemes')
    if (studentProfile?.course) {
      chips.push(`${studentProfile.course} scholarships`)
    } else {
      chips.push('Scholarships with no income limit')
    }
    if (studentProfile?.state) {
      chips.push(`Scholarships in ${studentProfile.state}`)
    }
  }

  return (
    <div className="flex flex-wrap gap-2 pl-10 mb-3 animate-[fadeIn_0.3s_ease-out]">
      {chips.map(chip => (
        <button
          key={chip}
          onClick={() => onChipClick(chip)}
          className="px-3 py-1.5 text-xs font-medium bg-teal-50 text-teal-700 rounded-full border border-teal-200 hover:bg-teal-100 hover:border-teal-300 transition-colors"
        >
          {chip}
        </button>
      ))}
    </div>
  )
}
