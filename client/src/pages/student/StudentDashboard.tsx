import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';

// Icons for quick action cards
function MagnifyingGlassIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function ChatBubbleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function PencilSquareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}

interface QuickActionCardProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function QuickActionCard({ to, icon, title, description }: QuickActionCardProps) {
  return (
    <Link to={to}>
      <Card hoverable padding="lg" className="h-full">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-text-primary">{title}</h3>
            <p className="mt-1 text-sm text-text-secondary">{description}</p>
          </div>
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function StudentDashboard() {
  const { t } = useLanguage();
  const { user, profile, profileComplete } = useAuth();

  // Calculate profile completion percentage
  const calculateProfileCompletion = (): number => {
    if (!profile) return 0;
    const fields = [
      profile.name,
      profile.state,
      profile.category,
      profile.educationLevel,
      profile.income,
      profile.gender,
      profile.course,
    ];
    const completed = fields.filter((field) => field && field !== '').length;
    return Math.round((completed / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  // Check if this is a new user (created within the last 5 minutes means first login session)
  const isNewUser = (): boolean => {
    if (!user) return false;
    const createdAt = user.created_at ? new Date(user.created_at).getTime() : 0;
    const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at).getTime() : 0;
    // If created_at and last_sign_in are within 5 minutes, it's likely a new user
    return Math.abs(lastSignIn - createdAt) < 5 * 60 * 1000;
  };

  const welcomeMessage = isNewUser()
    ? t(
        `Welcome${profile?.name ? `, ${profile.name}` : ''}!`,
        `स्वागत है${profile?.name ? `, ${profile.name}` : ''}!`,
        `வரவேற்கிறோம்${profile?.name ? `, ${profile.name}` : ''}!`,
        `స్వాగతం${profile?.name ? `, ${profile.name}` : ''}!`
      )
    : t(
        `Welcome back${profile?.name ? `, ${profile.name}` : ''}!`,
        `फिर से स्वागत है${profile?.name ? `, ${profile.name}` : ''}!`,
        `மீண்டும் வருக${profile?.name ? `, ${profile.name}` : ''}!`,
        `మళ్ళీ స్వాగతం${profile?.name ? `, ${profile.name}` : ''}!`
      );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{welcomeMessage}</h1>
        <p className="mt-1 text-text-secondary">
          {t(
            'Find scholarships that match your profile and start your journey.',
            'अपनी प्रोफ़ाइल से मेल खाती छात्रवृत्तियां खोजें और अपनी यात्रा शुरू करें।',
            'உங்கள் சுயவிவரத்துடன் பொருந்தும் உதவித்தொகைகளைக் கண்டறிந்து உங்கள் பயணத்தைத் தொடங்குங்கள்.',
            'మీ ప్రొఫైల్‌కు సరిపోలే స్కాలర్‌షిప్‌లను కనుగొని మీ ప్రయాణాన్ని ప్రారంభించండి.'
          )}
        </p>
      </div>

      {/* Profile Completion Alert */}
      {!profileComplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-800">
                {t(
                  'Complete Your Profile',
                  'अपनी प्रोफ़ाइल पूर्ण करें',
                  'உங்கள் சுயவிவரத்தை நிறைவு செய்யுங்கள்',
                  'మీ ప్రొఫైల్‌ను పూర్తి చేయండి'
                )}
              </h3>
              <p className="mt-1 text-sm text-amber-700">
                {t(
                  `Your profile is ${profileCompletion}% complete. Complete it to get personalized scholarship recommendations.`,
                  `आपकी प्रोफ़ाइल ${profileCompletion}% पूर्ण है। व्यक्तिगत छात्रवृत्ति सिफारिशें प्राप्त करने के लिए इसे पूर्ण करें।`,
                  `உங்கள் சுயவிவரம் ${profileCompletion}% நிறைவடைந்துள்ளது. தனிப்பயனாக்கப்பட்ட உதவித்தொகை பரிந்துரைகளைப் பெற இதை நிறைவு செய்யுங்கள்.`,
                  `మీ ప్రొఫైల్ ${profileCompletion}% పూర్తయింది. వ్యక్తిగత స్కాలర్‌షిప్ సిఫారసులను పొందడానికి దీన్ని పూర్తి చేయండి.`
                )}
              </p>
              <Link
                to="/student/profile"
                className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-amber-800 hover:text-amber-900"
              >
                {t('Update Profile', 'प्रोफ़ाइल अपडेट करें', 'சுயவிவரத்தைப் புதுப்பிக்கவும்', 'ప్రొఫైల్ నవీకరించండి')}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          {t('Get Started', 'शुरू करें', 'தொடங்குங்கள்', 'ప్రారంభించండి')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickActionCard
            to="/student/recommendations"
            icon={<SparklesIcon className="w-6 h-6 text-teal-600" />}
            title={t('Get Recommendations', 'सिफारिशें प्राप्त करें', 'பரிந்துரைகளைப் பெறுங்கள்', 'సిఫారసులు పొందండి')}
            description={t(
              'See scholarships matched to your profile.',
              'अपनी प्रोफ़ाइल से मेल खाती छात्रवृत्तियां देखें।',
              'உங்கள் சுயவிவரத்துடன் பொருந்தும் உதவித்தொகைகளைப் பாருங்கள்.',
              'మీ ప్రొఫైల్‌కు సరిపోలే స్కాలర్‌షిప్‌లను చూడండి.'
            )}
          />
          <QuickActionCard
            to="/student/search"
            icon={<MagnifyingGlassIcon className="w-6 h-6 text-teal-600" />}
            title={t('Browse All', 'सभी ब्राउज़ करें', 'அனைத்தையும் பார்க்க', 'అన్నీ బ్రౌజ్ చేయండి')}
            description={t(
              'Search and explore all available scholarships.',
              'सभी उपलब्ध छात्रवृत्तियों को खोजें और एक्सप्लोर करें।',
              'கிடைக்கும் அனைத்து உதவித்தொகைகளையும் தேடி ஆராயுங்கள்.',
              'అందుబాటులో ఉన్న అన్ని స్కాలర్‌షిప్‌లను శోధించి అన్వేషించండి.'
            )}
          />
          <QuickActionCard
            to="/student/chat"
            icon={<ChatBubbleIcon className="w-6 h-6 text-teal-600" />}
            title={t('Chat Assistant', 'चैट सहायक', 'அரட்டை உதவியாளர்', 'చాట్ అసిస్టెంట్')}
            description={t(
              'Ask questions and get personalized advice.',
              'सवाल पूछें और व्यक्तिगत सलाह प्राप्त करें।',
              'கேள்விகளைக் கேட்டு தனிப்பயனாக்கப்பட்ட ஆலோசனையைப் பெறுங்கள்.',
              'ప్రశ్నలు అడగండి మరియు వ్యక్తిగత సలహా పొందండి.'
            )}
          />
          <QuickActionCard
            to="/student/profile"
            icon={<PencilSquareIcon className="w-6 h-6 text-teal-600" />}
            title={t('Update Profile', 'प्रोफ़ाइल अपडेट करें', 'சுயவிவரத்தைப் புதுப்பிக்கவும்', 'ప్రొఫైల్ నవీకరించండి')}
            description={t(
              'Keep your profile updated for better matches.',
              'बेहतर मिलान के लिए अपनी प्रोफ़ाइल अपडेट रखें।',
              'சிறந்த பொருத்தங்களுக்கு உங்கள் சுயவிவரத்தைப் புதுப்பித்து வைக்கவும்.',
              'మెరుగైన సరిపోలికల కోసం మీ ప్రొఫైల్‌ను నవీకరించండి.'
            )}
          />
        </div>
      </div>
    </div>
  );
}
