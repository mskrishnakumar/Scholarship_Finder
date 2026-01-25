import { useLanguage } from '../../context/LanguageContext';
import { Card, CardHeader } from '../../components/common/Card';
import GuidedFlow from '../../components/GuidedFlow';

export default function StudentSearch() {
  const { t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto">
      <Card padding="none" className="overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <CardHeader
            title={t(
              'Find Scholarships',
              'छात्रवृत्ति खोजें',
              'உதவித்தொகைகளைக் கண்டறியவும்',
              'స్కాలర్‌షిప్‌లను కనుగొనండి'
            )}
            subtitle={t(
              'Answer a few questions to find scholarships that match your profile',
              'अपनी प्रोफ़ाइल से मेल खाती छात्रवृत्ति खोजने के लिए कुछ सवालों के जवाब दें',
              'உங்கள் சுயவிவரத்துடன் பொருந்தும் உதவித்தொகைகளைக் கண்டறிய சில கேள்விகளுக்கு பதிலளியுங்கள்',
              'మీ ప్రొఫైల్‌తో సరిపోలే స్కాలర్‌షిప్‌లను కనుగొనడానికి కొన్ని ప్రశ్నలకు సమాధానం ఇవ్వండి'
            )}
          />
        </div>

        {/* GuidedFlow Component */}
        <div className="h-[500px]">
          <GuidedFlow />
        </div>
      </Card>

      {/* Info Card */}
      <Card padding="md" className="mt-6 bg-teal-50 border border-teal-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-teal-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-teal-800">
              {t('Tip', 'टिप', 'குறிப்பு', 'చిట్కా')}
            </h4>
            <p className="mt-1 text-sm text-teal-700">
              {t(
                'For more personalized results, make sure your profile is complete. You can also use the Chat Assistant for free-form questions about scholarships.',
                'अधिक व्यक्तिगत परिणामों के लिए, सुनिश्चित करें कि आपकी प्रोफ़ाइल पूर्ण है। आप छात्रवृत्ति के बारे में मुक्त प्रश्नों के लिए चैट सहायक का भी उपयोग कर सकते हैं।',
                'மேலும் தனிப்பயனாக்கப்பட்ட முடிவுகளுக்கு, உங்கள் சுயவிவரம் முழுமையானது என்பதை உறுதிப்படுத்தவும். உதவித்தொகைகளைப் பற்றிய கட்டற்ற கேள்விகளுக்கு அரட்டை உதவியாளரையும் பயன்படுத்தலாம்.',
                'మరింత వ్యక్తిగతీకరించిన ఫలితాల కోసం, మీ ప్రొఫైల్ పూర్తయిందని నిర్ధారించుకోండి. స్కాలర్‌షిప్‌ల గురించి ఫ్రీ-ఫారమ్ ప్రశ్నల కోసం మీరు చాట్ అసిస్టెంట్‌ను కూడా ఉపయోగించవచ్చు.'
              )}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
