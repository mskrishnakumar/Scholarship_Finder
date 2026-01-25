import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import type { Language } from '../../context/LanguageContext';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

const LANGUAGES: { code: Language; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
];

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export default function StudentSettings() {
  const { t, language, setLanguage } = useLanguage();

  // Notification settings state (placeholder - would be persisted to backend in production)
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: 'new_scholarships',
      label: t(
        'New Scholarship Matches',
        'नई छात्रवृत्ति मिलान',
        'புதிய உதவித்தொகை பொருத்தங்கள்',
        'కొత్త స్కాలర్‌షిప్ సరిపోలికలు'
      ),
      description: t(
        'Get notified when new scholarships match your profile',
        'जब नई छात्रवृत्ति आपकी प्रोफ़ाइल से मेल खाती है तो सूचना प्राप्त करें',
        'புதிய உதவித்தொகைகள் உங்கள் சுயவிவரத்துடன் பொருந்தும்போது அறிவிப்பைப் பெறுங்கள்',
        'కొత్త స్కాలర్‌షిప్‌లు మీ ప్రొఫైల్‌తో సరిపోలినప్పుడు నోటిఫికేషన్ పొందండి'
      ),
      enabled: true,
    },
    {
      id: 'deadline_reminders',
      label: t(
        'Deadline Reminders',
        'समय सीमा अनुस्मारक',
        'காலக்கெடு நினைவூட்டல்கள்',
        'గడువు రిమైండర్లు'
      ),
      description: t(
        'Receive reminders before scholarship deadlines',
        'छात्रवृत्ति की समय सीमा से पहले अनुस्मारक प्राप्त करें',
        'உதவித்தொகை காலக்கெடுக்கு முன் நினைவூட்டல்களைப் பெறுங்கள்',
        'స్కాలర్‌షిప్ గడువుకు ముందు రిమైండర్లు అందుకోండి'
      ),
      enabled: true,
    },
    {
      id: 'application_updates',
      label: t(
        'Application Updates',
        'आवेदन अपडेट',
        'விண்ணப்ப புதுப்பிப்புகள்',
        'అప్లికేషన్ అప్‌డేట్‌లు'
      ),
      description: t(
        'Get updates on your scholarship applications',
        'अपने छात्रवृत्ति आवेदनों पर अपडेट प्राप्त करें',
        'உங்கள் உதவித்தொகை விண்ணப்பங்களில் புதுப்பிப்புகளைப் பெறுங்கள்',
        'మీ స్కాలర్‌షిప్ అప్లికేషన్‌లపై అప్‌డేట్‌లు పొందండి'
      ),
      enabled: false,
    },
    {
      id: 'tips_news',
      label: t(
        'Tips & News',
        'टिप्स और समाचार',
        'குறிப்புகள் & செய்திகள்',
        'చిట్కాలు & వార్తలు'
      ),
      description: t(
        'Receive helpful tips and scholarship news',
        'उपयोगी टिप्स और छात्रवृत्ति समाचार प्राप्त करें',
        'பயனுள்ள குறிப்புகள் மற்றும் உதவித்தொகை செய்திகளைப் பெறுங்கள்',
        'సహాయకరమైన చిట్కాలు మరియు స్కాలర్‌షిప్ వార్తలను అందుకోండి'
      ),
      enabled: false,
    },
  ]);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  const handleNotificationToggle = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
  };

  const handleSaveSettings = async () => {
    setSaveStatus('saving');
    // Simulate API call - in production this would save to backend
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          {t('Settings', 'सेटिंग्स', 'அமைப்புகள்', 'సెట్టింగ్‌లు')}
        </h1>
        <p className="mt-1 text-text-secondary">
          {t(
            'Manage your preferences and account settings',
            'अपनी प्राथमिकताएं और खाता सेटिंग्स प्रबंधित करें',
            'உங்கள் விருப்பங்கள் மற்றும் கணக்கு அமைப்புகளை நிர்வகிக்கவும்',
            'మీ ప్రాధాన్యతలు మరియు ఖాతా సెట్టింగ్‌లను నిర్వహించండి'
          )}
        </p>
      </div>

      {/* Language Settings */}
      <Card padding="none">
        <div className="p-6">
          <CardHeader
            title={t('Language', 'भाषा', 'மொழி', 'భాష')}
            subtitle={t(
              'Select your preferred language for the application',
              'एप्लिकेशन के लिए अपनी पसंदीदा भाषा चुनें',
              'பயன்பாட்டிற்கான உங்களுக்குப் பிடித்த மொழியைத் தேர்ந்தெடுக்கவும்',
              'అప్లికేషన్ కోసం మీకు ఇష్టమైన భాషను ఎంచుకోండి'
            )}
          />
        </div>
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`
                  px-4 py-3 rounded-xl border-2 text-center transition-all duration-200
                  ${
                    language === lang.code
                      ? 'border-teal-600 bg-teal-50 text-teal-700'
                      : 'border-gray-200 bg-white text-text-primary hover:border-gray-300'
                  }
                `}
              >
                <div className="font-medium">{lang.nativeLabel}</div>
                <div className="text-xs text-text-secondary mt-0.5">
                  {lang.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card padding="none">
        <div className="p-6">
          <CardHeader
            title={t('Notifications', 'सूचनाएं', 'அறிவிப்புகள்', 'నోటిఫికేషన్లు')}
            subtitle={t(
              'Choose what updates you want to receive',
              'चुनें कि आप कौन से अपडेट प्राप्त करना चाहते हैं',
              'நீங்கள் என்ன புதுப்பிப்புகளைப் பெற விரும்புகிறீர்கள் என்பதைத் தேர்ந்தெடுக்கவும்',
              'మీరు ఏ అప్‌డేట్‌లను అందుకోవాలనుకుంటున్నారో ఎంచుకోండి'
            )}
          />
        </div>
        <div className="px-6 pb-6 space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary">
                  {notification.label}
                </div>
                <div className="text-sm text-text-secondary mt-0.5">
                  {notification.description}
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle(notification.id)}
                className={`
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                  transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2
                  ${notification.enabled ? 'bg-teal-600' : 'bg-gray-200'}
                `}
                role="switch"
                aria-checked={notification.enabled}
              >
                <span
                  className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
                    transition duration-200 ease-in-out
                    ${notification.enabled ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Data & Privacy */}
      <Card padding="none">
        <div className="p-6">
          <CardHeader
            title={t('Data & Privacy', 'डेटा और गोपनीयता', 'தரவு & தனியுரிமை', 'డేటా & ప్రైవసీ')}
            subtitle={t(
              'Manage your data and privacy settings',
              'अपना डेटा और गोपनीयता सेटिंग्स प्रबंधित करें',
              'உங்கள் தரவு மற்றும் தனியுரிமை அமைப்புகளை நிர்வகிக்கவும்',
              'మీ డేటా మరియు ప్రైవసీ సెట్టింగ్‌లను నిర్వహించండి'
            )}
          />
        </div>
        <div className="px-6 pb-6">
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-text-primary">
                    {t('Download My Data', 'मेरा डेटा डाउनलोड करें', 'எனது தரவைப் பதிவிறக்கவும்', 'నా డేటాను డౌన్‌లోడ్ చేయండి')}
                  </div>
                  <div className="text-sm text-text-secondary mt-0.5">
                    {t(
                      'Get a copy of your profile and activity data',
                      'अपनी प्रोफ़ाइल और गतिविधि डेटा की एक प्रति प्राप्त करें',
                      'உங்கள் சுயவிவரம் மற்றும் செயல்பாட்டுத் தரவின் நகலைப் பெறுங்கள்',
                      'మీ ప్రొఫైల్ మరియు యాక్టివిటీ డేటా కాపీని పొందండి'
                    )}
                  </div>
                </div>
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
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl border border-red-200 hover:border-red-300 hover:bg-red-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-red-600">
                    {t('Delete Account', 'खाता हटाएं', 'கணக்கை நீக்கு', 'ఖాతాను తొలగించండి')}
                  </div>
                  <div className="text-sm text-red-500 mt-0.5">
                    {t(
                      'Permanently delete your account and all data',
                      'अपना खाता और सभी डेटा स्थायी रूप से हटाएं',
                      'உங்கள் கணக்கையும் எல்லா தரவையும் நிரந்தரமாக நீக்கவும்',
                      'మీ ఖాతా మరియు మొత్తం డేటాను శాశ్వతంగా తొలగించండి'
                    )}
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-red-400"
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
            </button>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSaveSettings}
          isLoading={saveStatus === 'saving'}
        >
          {saveStatus === 'saved'
            ? t('Saved!', 'सहेजा गया!', 'சேமிக்கப்பட்டது!', 'సేవ్ చేయబడింది!')
            : t('Save Settings', 'सेटिंग्स सहेजें', 'அமைப்புகளைச் சேமிக்கவும்', 'సెట్టింగ్‌లను సేవ్ చేయండి')}
        </Button>
      </div>
    </div>
  );
}
