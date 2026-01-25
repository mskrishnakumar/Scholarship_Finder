import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';

// Icons for stat cards
function AcademicCapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 14l9-5-9-5-9 5 9 5z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
      />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function UserCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

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
  const { profile } = useAuth();

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

  // Mock data for stats - in production these would come from API/context
  const matchesFound = 12;
  const deadlinesThisWeek = 3;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          {t(
            `Welcome back${profile?.name ? `, ${profile.name}` : ''}!`,
            `फिर से स्वागत है${profile?.name ? `, ${profile.name}` : ''}!`,
            `மீண்டும் வருக${profile?.name ? `, ${profile.name}` : ''}!`,
            `మళ్ళీ స్వాగతం${profile?.name ? `, ${profile.name}` : ''}!`
          )}
        </h1>
        <p className="mt-1 text-text-secondary">
          {t(
            'Here is an overview of your scholarship search progress.',
            'यहां आपकी छात्रवृत्ति खोज की प्रगति का अवलोकन है।',
            'உங்கள் உதவித்தொகை தேடல் முன்னேற்றத்தின் கண்ணோட்டம் இங்கே.',
            'మీ స్కాలర్‌షిప్ శోధన పురోగతి యొక్క అవలోకనం ఇక్కడ ఉంది.'
          )}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={AcademicCapIcon}
          label={t('Matches Found', 'मिलान मिले', 'பொருத்தங்கள் கண்டறியப்பட்டன', 'సరిపోలికలు కనుగొనబడ్డాయి')}
          value={matchesFound}
          color="teal"
        />
        <StatCard
          icon={CalendarIcon}
          label={t('Deadlines This Week', 'इस सप्ताह की समय सीमाएं', 'இந்த வாரத்தின் காலக்கெடுக்கள்', 'ఈ వారం గడువులు')}
          value={deadlinesThisWeek}
          color="amber"
        />
        <StatCard
          icon={UserCircleIcon}
          label={t('Profile Completion', 'प्रोफ़ाइल पूर्णता', 'சுயவிவரம் நிறைவு', 'ప్రొఫైల్ పూర్తి')}
          value={`${profileCompletion}%`}
          color="blue"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          {t('Quick Actions', 'त्वरित कार्य', 'விரைவு செயல்கள்', 'త్వరిత చర్యలు')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            to="/student/search"
            icon={<MagnifyingGlassIcon className="w-6 h-6 text-teal-600" />}
            title={t('Find Scholarships', 'छात्रवृत्ति खोजें', 'உதவித்தொகைகளைக் கண்டறியவும்', 'స్కాలర్‌షిప్‌లను కనుగొనండి')}
            description={t(
              'Search and discover scholarships that match your profile.',
              'अपनी प्रोफ़ाइल से मेल खाती छात्रवृत्ति खोजें।',
              'உங்கள் சுயவிவரத்துடன் பொருந்தும் உதவித்தொகைகளைத் தேடுங்கள்.',
              'మీ ప్రొఫైల్‌కు సరిపోలే స్కాలర్‌షిప్‌లను శోధించండి.'
            )}
          />
          <QuickActionCard
            to="/student/chat"
            icon={<ChatBubbleIcon className="w-6 h-6 text-teal-600" />}
            title={t('Chat Assistant', 'चैट सहायक', 'அரட்டை உதவியாளர்', 'చాట్ అసిస్టెంట్')}
            description={t(
              'Ask questions and get personalized scholarship advice.',
              'सवाल पूछें और व्यक्तिगत छात्रवृत्ति सलाह प्राप्त करें।',
              'கேள்விகளைக் கேட்டு தனிப்பயனாக்கப்பட்ட ஆலோசனையைப் பெறுங்கள்.',
              'ప్రశ్నలు అడగండి మరియు వ్యక్తిగత సలహా పొందండి.'
            )}
          />
          <QuickActionCard
            to="/student/profile"
            icon={<PencilSquareIcon className="w-6 h-6 text-teal-600" />}
            title={t('Update Profile', 'प्रोफ़ाइल अपडेट करें', 'சுயவிவரத்தைப் புதுப்பிக்கவும்', 'ప్రొఫైల్ నవీకరించండి')}
            description={t(
              'Keep your profile updated for better scholarship matches.',
              'बेहतर छात्रवृत्ति मिलान के लिए अपनी प्रोफ़ाइल अपडेट रखें।',
              'சிறந்த உதவித்தொகை பொருத்தங்களுக்கு உங்கள் சுயவிவரத்தைப் புதுப்பித்து வைக்கவும்.',
              'మెరుగైన స్కాలర్‌షిప్ సరిపోలికల కోసం మీ ప్రొఫైల్‌ను నవీకరించండి.'
            )}
          />
        </div>
      </div>
    </div>
  );
}
