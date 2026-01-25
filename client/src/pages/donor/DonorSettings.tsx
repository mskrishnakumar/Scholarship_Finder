import { useState } from 'react'
import { useLanguage, Language } from '../../context/LanguageContext'
import { Card, CardHeader } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import {
  LanguageIcon,
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline'

interface NotificationSettings {
  emailNewApplication: boolean
  emailStatusChange: boolean
  emailWeeklyDigest: boolean
  smsNewApplication: boolean
  smsStatusChange: boolean
}

const LANGUAGES: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
]

export default function DonorSettings() {
  const { t, language, setLanguage } = useLanguage()

  const [notifications, setNotifications] = useState<NotificationSettings>(() => {
    const stored = localStorage.getItem('donorNotifications')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        // Ignore parse errors
      }
    }
    return {
      emailNewApplication: true,
      emailStatusChange: true,
      emailWeeklyDigest: false,
      smsNewApplication: false,
      smsStatusChange: false,
    }
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    // Show saved indicator briefly
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSaveNotifications = async () => {
    setSaving(true)
    try {
      localStorage.setItem('donorNotifications', JSON.stringify(notifications))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // Handle error silently
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('Settings', 'सेटिंग्स', 'அமைப்புகள்', 'సెట్టింగ్‌లు')}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {t(
            'Manage your preferences and notifications',
            'अपनी प्राथमिकताएं और सूचनाएं प्रबंधित करें',
            'உங்கள் விருப்பங்கள் மற்றும் அறிவிப்புகளை நிர்வகிக்கவும்',
            'మీ ప్రాధాన్యతలు మరియు నోటిఫికేషన్‌లను నిర్వహించండి'
          )}
        </p>
      </div>

      {/* Language Settings */}
      <Card padding="lg">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <LanguageIcon className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <CardHeader
              title={t('Language', 'भाषा', 'மொழி', 'భాష')}
              subtitle={t(
                'Choose your preferred language for the interface',
                'इंटरफ़ेस के लिए अपनी पसंदीदा भाषा चुनें',
                'இடைமுகத்திற்கான உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்',
                'ఇంటర్‌ఫేస్ కోసం మీకు నచ్చిన భాషను ఎంచుకోండి'
              )}
            />
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`
                    p-3 rounded-xl border-2 text-center transition-all
                    ${
                      language === lang.code
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <p className="font-medium text-gray-900">{lang.nativeName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{lang.name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card padding="lg">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <BellIcon className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <CardHeader
              title={t(
                'Notification Preferences',
                'अधिसूचना प्राथमिकताएं',
                'அறிவிப்பு விருப்பங்கள்',
                'నోటిఫికేషన్ ప్రాధాన్యతలు'
              )}
              subtitle={t(
                'Control how you receive updates about your scholarships',
                'अपनी छात्रवृत्तियों के बारे में अपडेट कैसे प्राप्त करें नियंत्रित करें',
                'உங்கள் உதவித்தொகைகள் பற்றிய புதுப்பிப்புகளை எவ்வாறு பெறுகிறீர்கள் என்பதைக் கட்டுப்படுத்தவும்',
                'మీ స్కాలర్‌షిప్‌ల గురించి అప్‌డేట్‌లను ఎలా అందుకుంటారో నియంత్రించండి'
              )}
            />

            {/* Email Notifications */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                <h4 className="text-sm font-medium text-gray-900">
                  {t(
                    'Email Notifications',
                    'ईमेल सूचनाएं',
                    'மின்னஞ்சல் அறிவிப்புகள்',
                    'ఇమెయిల్ నోటిఫికేషన్‌లు'
                  )}
                </h4>
              </div>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {t(
                      'New Applications',
                      'नए आवेदन',
                      'புதிய விண்ணப்பங்கள்',
                      'కొత్త దరఖాస్తులు'
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t(
                      'Get notified when students apply to your scholarships',
                      'जब छात्र आपकी छात्रवृत्तियों के लिए आवेदन करें तो सूचित करें',
                      'மாணவர்கள் உங்கள் உதவித்தொகைகளுக்கு விண்ணப்பிக்கும் போது அறிவிப்பு பெறுங்கள்',
                      'విద్యార్థులు మీ స్కాలర్‌షిప్‌లకు దరఖాస్తు చేసినప్పుడు తెలియజేయండి'
                    )}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailNewApplication}
                  onChange={() => handleNotificationChange('emailNewApplication')}
                  className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {t(
                      'Status Changes',
                      'स्थिति परिवर्तन',
                      'நிலை மாற்றங்கள்',
                      'స్థితి మార్పులు'
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t(
                      'Get notified when your scholarship status is updated',
                      'जब आपकी छात्रवृत्ति की स्थिति अपडेट हो तो सूचित करें',
                      'உங்கள் உதவித்தொகை நிலை புதுப்பிக்கப்படும் போது அறிவிப்பு பெறுங்கள்',
                      'మీ స్కాలర్‌షిప్ స్థితి అప్‌డేట్ అయినప్పుడు తెలియజేయండి'
                    )}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailStatusChange}
                  onChange={() => handleNotificationChange('emailStatusChange')}
                  className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {t(
                      'Weekly Digest',
                      'साप्ताहिक सारांश',
                      'வாராந்திர சுருக்கம்',
                      'వారపు డైజెస్ట్'
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t(
                      'Receive a weekly summary of scholarship activity',
                      'छात्रवृत्ति गतिविधि का साप्ताहिक सारांश प्राप्त करें',
                      'உதவித்தொகை செயல்பாட்டின் வாராந்திர சுருக்கத்தைப் பெறுங்கள்',
                      'స్కాలర్‌షిప్ కార్యకలాపాల వారపు సారాంశాన్ని అందుకోండి'
                    )}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailWeeklyDigest}
                  onChange={() => handleNotificationChange('emailWeeklyDigest')}
                  className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
              </label>
            </div>

            {/* SMS Notifications */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <DevicePhoneMobileIcon className="w-5 h-5 text-gray-400" />
                <h4 className="text-sm font-medium text-gray-900">
                  {t(
                    'SMS Notifications',
                    'SMS सूचनाएं',
                    'SMS அறிவிப்புகள்',
                    'SMS నోటిఫికేషన్‌లు'
                  )}
                </h4>
              </div>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {t(
                      'New Applications',
                      'नए आवेदन',
                      'புதிய விண்ணப்பங்கள்',
                      'కొత్త దరఖాస్తులు'
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t(
                      'Receive SMS for new applications',
                      'नए आवेदनों के लिए SMS प्राप्त करें',
                      'புதிய விண்ணப்பங்களுக்கு SMS பெறுங்கள்',
                      'కొత్త దరఖాస్తుల కోసం SMS అందుకోండి'
                    )}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.smsNewApplication}
                  onChange={() => handleNotificationChange('smsNewApplication')}
                  className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {t(
                      'Status Changes',
                      'स्थिति परिवर्तन',
                      'நிலை மாற்றங்கள்',
                      'స్థితి మార్పులు'
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t(
                      'Receive SMS when status changes',
                      'स्थिति बदलने पर SMS प्राप्त करें',
                      'நிலை மாறும் போது SMS பெறுங்கள்',
                      'స్థితి మారినప్పుడు SMS అందుకోండి'
                    )}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.smsStatusChange}
                  onChange={() => handleNotificationChange('smsStatusChange')}
                  className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
              </label>
            </div>

            {/* Save Button */}
            <div className="mt-6 flex items-center justify-end gap-3">
              {saved && (
                <span className="text-sm text-green-600">
                  {t('Saved!', 'सहेजा गया!', 'சேமிக்கப்பட்டது!', 'సేవ్ చేయబడింది!')}
                </span>
              )}
              <Button onClick={handleSaveNotifications} isLoading={saving}>
                {t(
                  'Save Preferences',
                  'प्राथमिकताएं सहेजें',
                  'விருப்பங்களைச் சேமி',
                  'ప్రాధాన్యతలు సేవ్ చేయి'
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
