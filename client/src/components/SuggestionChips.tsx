interface SuggestionChipsProps {
  studentState?: string
  language: string
  onChipClick: (text: string) => void
}

export default function SuggestionChips({ studentState, language, onChipClick }: SuggestionChipsProps) {
  const chips = language === 'hi'
    ? [
        'SC छात्रों के लिए छात्रवृत्ति',
        'पोस्ट-मैट्रिक योजनाएं',
        'बिना आय सीमा वाली छात्रवृत्ति',
        ...(studentState ? [`${studentState} की छात्रवृत्ति`] : [])
      ]
    : [
        'Scholarships for SC students',
        'Post-matric schemes',
        'Scholarships with no income limit',
        ...(studentState ? [`Scholarships in ${studentState}`] : [])
      ]

  return (
    <div className="flex flex-wrap gap-2 pl-10 mb-3 animate-[fadeIn_0.3s_ease-out]">
      {chips.map(chip => (
        <button
          key={chip}
          onClick={() => onChipClick(chip)}
          className="px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 transition-colors"
        >
          {chip}
        </button>
      ))}
    </div>
  )
}
