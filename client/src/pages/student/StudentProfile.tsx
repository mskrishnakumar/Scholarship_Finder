import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

// Chevron Icon
function ChevronDown({ className, rotated }: { className?: string; rotated?: boolean }) {
  return (
    <svg
      className={`${className} transition-transform duration-200 ${rotated ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// Collapsible section component (matching StudentSearch style)
interface ProfileSectionProps {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  isComplete: boolean;
  children: React.ReactNode;
}

function ProfileSection({ title, subtitle, isOpen, onToggle, isComplete, children }: ProfileSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            isComplete ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
          }`}>
            {isComplete ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : null}
          </div>
          <div>
            <h3 className="font-medium text-gray-800">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <ChevronDown className="w-5 h-5 text-gray-400" rotated={isOpen} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

interface ProfileFieldProps {
  label: string;
  value: string | undefined;
}

function ProfileField({ label, value }: ProfileFieldProps) {
  const { t } = useLanguage();

  return (
    <div className="flex justify-between items-start py-2.5 border-b border-gray-100 last:border-b-0">
      <dt className="text-sm text-gray-600">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 text-right">
        {value || (
          <span className="text-gray-400 italic font-normal">
            {t('Not provided', 'प्रदान नहीं किया गया', 'வழங்கப்படவில்லை', 'అందించబడలేదు')}
          </span>
        )}
      </dd>
    </div>
  );
}

export default function StudentProfile() {
  const { t } = useLanguage();
  const { user, profile, profileComplete } = useAuth();
  const navigate = useNavigate();

  // Section open states
  const [openSections, setOpenSections] = useState({
    personal: true,
    education: false,
    eligibility: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleEditProfile = () => {
    navigate('/student/onboarding?edit=true');
  };

  // Map category codes to display names
  const getCategoryDisplay = (category: string | undefined): string => {
    if (!category) return '';
    const categoryMap: Record<string, string> = {
      general: t('General', 'सामान्य', 'பொது', 'సాధారణ'),
      obc: t('OBC', 'ओबीसी', 'ஓபிசி', 'ఓబీసీ'),
      sc: t('SC', 'एससी', 'எஸ்சி', 'ఎస్సీ'),
      st: t('ST', 'एसटी', 'எஸ்டி', 'ఎస్టీ'),
      ews: t('EWS', 'ईडब्ल्यूएस', 'ஈடபிள்யூஎஸ்', 'ఈడబ్ల్యూఎస్'),
      minority: t('Minority', 'अल्पसंख्यक', 'சிறுபான்மையினர்', 'మైనారిటీ'),
    };
    return categoryMap[category.toLowerCase()] || category;
  };

  // Map education level codes to display names
  const getEducationDisplay = (level: string | undefined): string => {
    if (!level) return '';
    const educationMap: Record<string, string> = {
      '10th': t('10th / SSC', '10वीं / एसएससी', '10ஆம் / எஸ்எஸ்சி', '10వ / ఎస్ఎస్సి'),
      '12th': t('12th / HSC', '12वीं / एचएससी', '12ஆம் / எச்எஸ்சி', '12వ / హెచ్ఎస్సి'),
      undergraduate: t('Undergraduate', 'स्नातक', 'இளங்கலை', 'అండర్ గ్రాడ్యుయేట్'),
      postgraduate: t('Postgraduate', 'स्नातकोत्तर', 'முதுகலை', 'పోస్ట్ గ్రాడ్యుయేట్'),
      diploma: t('Diploma', 'डिप्लोमा', 'டிப்ளமோ', 'డిప్లొమా'),
      phd: t('PhD', 'पीएचडी', 'முனைவர்', 'పీహెచ్డీ'),
    };
    return educationMap[level.toLowerCase()] || level;
  };

  // Map income level codes to display names
  const getIncomeDisplay = (income: string | undefined): string => {
    if (!income) return '';
    const incomeMap: Record<string, string> = {
      below_1l: t('Below 1 Lakh', '1 लाख से कम', '1 லட்சத்துக்கு கீழ்', '1 లక్ష కంటే తక్కువ'),
      '1l_2.5l': t('1 - 2.5 Lakhs', '1 - 2.5 लाख', '1 - 2.5 லட்சம்', '1 - 2.5 లక్షలు'),
      '2.5l_5l': t('2.5 - 5 Lakhs', '2.5 - 5 लाख', '2.5 - 5 லட்சம்', '2.5 - 5 లక్షలు'),
      '5l_8l': t('5 - 8 Lakhs', '5 - 8 लाख', '5 - 8 லட்சம்', '5 - 8 లక్షలు'),
      above_8l: t('Above 8 Lakhs', '8 लाख से अधिक', '8 லட்சத்துக்கு மேல்', '8 లక్షల కంటే ఎక్కువ'),
    };
    return incomeMap[income.toLowerCase()] || income;
  };

  // Map gender codes to display names
  const getGenderDisplay = (gender: string | undefined): string => {
    if (!gender) return '';
    const genderMap: Record<string, string> = {
      male: t('Male', 'पुरुष', 'ஆண்', 'పురుషుడు'),
      female: t('Female', 'महिला', 'பெண்', 'స్త్రీ'),
      other: t('Other', 'अन्य', 'மற்றவை', 'ఇతర'),
    };
    return genderMap[gender.toLowerCase()] || gender;
  };

  // Check section completion
  const isPersonalComplete = !!(profile?.name && profile?.gender && profile?.state);
  const isEducationComplete = !!(profile?.educationLevel);
  const isEligibilityComplete = !!(profile?.category || profile?.income);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Completion Prompt - Shown at top for visibility */}
      {!profileComplete && (
        <Card padding="lg" className="bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-800">
                {t('Complete Your Profile', 'अपनी प्रोफ़ाइल पूर्ण करें', 'உங்கள் சுயவிவரத்தை நிறைவு செய்யுங்கள்', 'మీ ప్రొఫైల్‌ను పూర్తి చేయండి')}
              </h3>
              <p className="mt-1 text-sm text-amber-700">
                {t(
                  'A complete profile helps us find better scholarship matches for you.',
                  'एक पूर्ण प्रोफ़ाइल हमें आपके लिए बेहतर छात्रवृत्ति मिलान खोजने में मदद करती है।',
                  'முழுமையான சுயவிவரம் உங்களுக்கு சிறந்த உதவித்தொகை பொருத்தங்களைக் கண்டறிய உதவுகிறது.',
                  'పూర్తి ప్రొఫైల్ మీకు మెరుగైన స్కాలర్‌షిప్ సరిపోలికలను కనుగొనడంలో సహాయపడుతుంది.'
                )}
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-3"
                onClick={handleEditProfile}
              >
                {t('Complete Now', 'अभी पूर्ण करें', 'இப்போது நிறைவு செய்', 'ఇప్పుడు పూర్తి చేయండి')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Profile Header */}
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0 w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-teal-700">
              {profile?.name?.charAt(0)?.toUpperCase() || 'S'}
            </span>
          </div>

          {/* Name and Email */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-text-primary">
                {profile?.name || t('Student', 'छात्र', 'மாணவர்', 'విద్యార్థి')}
              </h1>
              {profileComplete ? (
                <Badge variant="success" size="sm">
                  {t('Profile Complete', 'प्रोफ़ाइल पूर्ण', 'சுயவிவரம் முழுமை', 'ప్రొఫైల్ పూర్తి')}
                </Badge>
              ) : (
                <Badge variant="warning" size="sm">
                  {t('Incomplete', 'अपूर्ण', 'முழுமையற்றது', 'అసంపూర్ణం')}
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-text-secondary">{user?.email}</p>
          </div>

          {/* Edit Button */}
          <div className="flex-shrink-0">
            <Button variant="primary" size="md" onClick={handleEditProfile}>
              {t('Edit Profile', 'प्रोफ़ाइल संपादित करें', 'சுயவிவரத்தைத் திருத்து', 'ప్రొఫైల్ సవరించండి')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Collapsible Profile Sections */}
      <div className="space-y-4">
        {/* Personal Information Section */}
        <ProfileSection
          title={t('Personal Details', 'व्यक्तिगत विवरण', 'தனிப்பட்ட விவரங்கள்', 'వ్యక్తిగత వివరాలు')}
          subtitle={t('Name, gender, state and location', 'नाम, लिंग, राज्य और स्थान', 'பெயர், பாலினம், மாநிலம் மற்றும் இடம்', 'పేరు, లింగం, రాష్ట్రం మరియు స్థానం')}
          isOpen={openSections.personal}
          onToggle={() => toggleSection('personal')}
          isComplete={isPersonalComplete}
        >
          <dl className="space-y-0">
            <ProfileField
              label={t('Full Name', 'पूरा नाम', 'முழு பெயர்', 'పూర్తి పేరు')}
              value={profile?.name}
            />
            <ProfileField
              label={t('Email', 'ईमेल', 'மின்னஞ்சல்', 'ఇమెయిల్')}
              value={user?.email}
            />
            <ProfileField
              label={t('Gender', 'लिंग', 'பாலினம்', 'లింగం')}
              value={getGenderDisplay(profile?.gender)}
            />
            <ProfileField
              label={t('State', 'राज्य', 'மாநிலம்', 'రాష్ట్రం')}
              value={profile?.state}
            />
            <ProfileField
              label={t('Area', 'क्षेत्र', 'பகுதி', 'ప్రాంతం')}
              value={profile?.area}
            />
          </dl>
        </ProfileSection>

        {/* Education Section */}
        <ProfileSection
          title={t('Education Details', 'शिक्षा विवरण', 'கல்வி விவரங்கள்', 'విద్యా వివరాలు')}
          subtitle={t('Current education level and course', 'वर्तमान शिक्षा स्तर और पाठ्यक्रम', 'தற்போதைய கல்வி நிலை மற்றும் படிப்பு', 'ప్రస్తుత విద్యా స్థాయి మరియు కోర్సు')}
          isOpen={openSections.education}
          onToggle={() => toggleSection('education')}
          isComplete={isEducationComplete}
        >
          <dl className="space-y-0">
            <ProfileField
              label={t('Education Level', 'शिक्षा स्तर', 'கல்வி நிலை', 'విద్యా స్థాయి')}
              value={getEducationDisplay(profile?.educationLevel)}
            />
            <ProfileField
              label={t('Course / Field of Study', 'पाठ्यक्रम / अध्ययन क्षेत्र', 'படிப்பு / துறை', 'కోర్సు / అధ్యయన రంగం')}
              value={profile?.course}
            />
          </dl>
        </ProfileSection>

        {/* Eligibility Section */}
        <ProfileSection
          title={t('Eligibility Details', 'पात्रता विवरण', 'தகுதி விவரங்கள்', 'అర్హత వివరాలు')}
          subtitle={t('Category, income and other eligibility info', 'श्रेणी, आय और अन्य पात्रता जानकारी', 'வகை, வருமானம் மற்றும் பிற தகுதி தகவல்', 'వర్గం, ఆదాయం మరియు ఇతర అర్హత సమాచారం')}
          isOpen={openSections.eligibility}
          onToggle={() => toggleSection('eligibility')}
          isComplete={isEligibilityComplete}
        >
          <dl className="space-y-0">
            <ProfileField
              label={t('Category', 'श्रेणी', 'வகை', 'వర్గం')}
              value={getCategoryDisplay(profile?.category)}
            />
            <ProfileField
              label={t('Annual Family Income', 'वार्षिक पारिवारिक आय', 'ஆண்டு குடும்ப வருமானம்', 'వార్షిక కుటుంబ ఆదాయం')}
              value={getIncomeDisplay(profile?.income)}
            />
            <ProfileField
              label={t('Religion', 'धर्म', 'மதம்', 'మతం')}
              value={profile?.religion}
            />
            <div className="flex justify-between items-start py-2.5">
              <dt className="text-sm text-gray-600">
                {t('Disability', 'विकलांगता', 'ஊனம்', 'వికలాంగత్వం')}
              </dt>
              <dd className="text-sm font-medium text-gray-900 text-right">
                {profile?.disability !== undefined ? (
                  profile.disability ? (
                    t('Yes', 'हां', 'ஆம்', 'అవును')
                  ) : (
                    t('No', 'नहीं', 'இல்லை', 'కాదు')
                  )
                ) : (
                  <span className="text-gray-400 italic font-normal">
                    {t('Not provided', 'प्रदान नहीं किया गया', 'வழங்கப்படவில்லை', 'అందించబడలేదు')}
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </ProfileSection>
      </div>
    </div>
  );
}
