import { useLanguage } from '../../context/LanguageContext';
import { Card, CardHeader } from '../../components/common/Card';
import ChatWindow from '../../components/ChatWindow';

export default function StudentChat() {
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto">
      <Card padding="none" className="overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <CardHeader
            title={t(
              'Chat Assistant',
              'चैट सहायक',
              'அரட்டை உதவியாளர்',
              'చాట్ అసిస్టెంట్'
            )}
            subtitle={t(
              'Ask questions about scholarships and get personalized recommendations',
              'छात्रवृत्ति के बारे में प्रश्न पूछें और व्यक्तिगत सिफारिशें प्राप्त करें',
              'உதவித்தொகைகளைப் பற்றி கேள்விகள் கேட்டு தனிப்பயனாக்கப்பட்ட பரிந்துரைகளைப் பெறுங்கள்',
              'స్కాలర్‌షిప్‌ల గురించి ప్రశ్నలు అడగండి మరియు వ్యక్తిగత సిఫారసులను పొందండి'
            )}
          />
        </div>

        {/* Chat Window */}
        <div className="h-[500px]">
          <ChatWindow />
        </div>
      </Card>

      {/* Help Card */}
      <Card padding="md" className="mt-6 bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-800">
              {t('What you can ask', 'आप क्या पूछ सकते हैं', 'நீங்கள் என்ன கேட்கலாம்', 'మీరు ఏమి అడగవచ్చు')}
            </h4>
            <ul className="mt-2 text-sm text-blue-700 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">-</span>
                {t(
                  'Scholarships for specific categories (SC/ST/OBC/EWS)',
                  'विशेष श्रेणियों के लिए छात्रवृत्ति (SC/ST/OBC/EWS)',
                  'குறிப்பிட்ட வகைகளுக்கான உதவித்தொகைகள் (SC/ST/OBC/EWS)',
                  'నిర్దిష్ట వర్గాల కోసం స్కాలర్‌షిప్‌లు (SC/ST/OBC/EWS)'
                )}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">-</span>
                {t(
                  'Government schemes for your state',
                  'आपके राज्य के लिए सरकारी योजनाएं',
                  'உங்கள் மாநிலத்திற்கான அரசு திட்டங்கள்',
                  'మీ రాష్ట్రానికి ప్రభుత్వ పథకాలు'
                )}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">-</span>
                {t(
                  'Merit-based and need-based scholarships',
                  'योग्यता आधारित और आवश्यकता आधारित छात्रवृत्ति',
                  'தகுதி அடிப்படையிலான மற்றும் தேவை அடிப்படையிலான உதவித்தொகைகள்',
                  'మెరిట్-ఆధారిత మరియు అవసరం-ఆధారిత స్కాలర్‌షిప్‌లు'
                )}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">-</span>
                {t(
                  'Application deadlines and requirements',
                  'आवेदन की समय सीमा और आवश्यकताएं',
                  'விண்ணப்ப காலக்கெடுக்கள் மற்றும் தேவைகள்',
                  'దరఖాస్తు గడువులు మరియు అవసరాలు'
                )}
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
