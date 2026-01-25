import { useState } from 'react'
import {
  Cog6ToothIcon,
  GlobeAltIcon,
  BellIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../context/LanguageContext'
import type { Language } from '../../context/LanguageContext'
import { Card, CardHeader } from '../../components/common/Card'
import { Button } from '../../components/common/Button'

const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
]

export default function AdminSettings() {
  const { t, language, setLanguage } = useLanguage()
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language)
  const [saved, setSaved] = useState(false)

  const handleLanguageChange = (lang: Language) => {
    setSelectedLanguage(lang)
    setSaved(false)
  }

  const handleSave = () => {
    setLanguage(selectedLanguage)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <Cog6ToothIcon className="w-6 h-6 text-primary" />
          {t('Settings', 'सेटिंग्स', 'அமைப்புகள்', 'సెట్టింగ్‌లు')}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {t(
            'Manage platform settings and preferences',
            'प्लेटफॉर्म सेटिंग्स और प्राथमिकताएं प्रबंधित करें',
            'தளம் அமைப்புகள் மற்றும் விருப்பத்தேர்வுகளை நிர்வகிக்கவும்',
            'ప్లాట్‌ఫారమ్ సెట్టింగ్‌లు మరియు ప్రాధాన్యతలను నిర్వహించండి'
          )}
        </p>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
          {t(
            'Settings saved successfully!',
            'सेटिंग्स सफलतापूर्वक सहेजी गईं!',
            'அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன!',
            'సెట్టింగ్‌లు విజయవంతంగా సేవ్ చేయబడ్డాయి!'
          )}
        </div>
      )}

      {/* Language Settings */}
      <Card padding="lg">
        <CardHeader
          title={t('Language', 'भाषा', 'மொழி', 'భాష')}
          subtitle={t(
            'Select your preferred language for the interface',
            'इंटरफ़ेस के लिए अपनी पसंदीदा भाषा चुनें',
            'இடைமுகத்திற்கான உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்',
            'ఇంటర్‌ఫేస్ కోసం మీ ఇష్టమైన భాషను ఎంచుకోండి'
          )}
          className="mb-4"
        />
        <div className="flex items-center gap-2 mb-4">
          <GlobeAltIcon className="w-5 h-5 text-text-secondary" />
          <span className="text-sm text-text-secondary">
            {t(
              'Interface Language',
              'इंटरफ़ेस भाषा',
              'இடைமுக மொழி',
              'ఇంటర్‌ఫేస్ భాష'
            )}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {LANGUAGES.map(({ code, label, native }) => (
            <button
              key={code}
              onClick={() => handleLanguageChange(code)}
              className={`p-4 rounded-lg border-2 transition-colors text-left ${
                selectedLanguage === code
                  ? 'border-primary bg-primary-light'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-text-primary">{native}</div>
              <div className="text-sm text-text-secondary">{label}</div>
            </button>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Button
            onClick={handleSave}
            disabled={selectedLanguage === language}
          >
            {t('Save Changes', 'परिवर्तन सहेजें', 'மாற்றங்களைச் சேமி', 'మార్పులను సేవ్ చేయండి')}
          </Button>
        </div>
      </Card>

      {/* Notification Settings (Placeholder) */}
      <Card padding="lg">
        <CardHeader
          title={t('Notifications', 'सूचनाएं', 'அறிவிப்புகள்', 'నోటిఫికేషన్లు')}
          subtitle={t(
            'Configure notification preferences',
            'अधिसूचना प्राथमिकताएं कॉन्फ़िगर करें',
            'அறிவிப்பு விருப்பத்தேர்வுகளை உள்ளமைக்கவும்',
            'నోటిఫికేషన్ ప్రాధాన్యతలను కాన్ఫిగర్ చేయండి'
          )}
          className="mb-4"
        />
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <BellIcon className="w-5 h-5 text-text-secondary" />
              <div>
                <div className="text-sm font-medium text-text-primary">
                  {t(
                    'Email Notifications',
                    'ईमेल सूचनाएं',
                    'மின்னஞ்சல் அறிவிப்புகள்',
                    'ఈమెయిల్ నోటిఫికేషన్లు'
                  )}
                </div>
                <div className="text-xs text-text-secondary">
                  {t(
                    'Receive email updates for new scholarship submissions',
                    'नई छात्रवृत्ति प्रस्तुतियों के लिए ईमेल अपडेट प्राप्त करें',
                    'புதிய உதவித்தொகை சமர்ப்பிப்புகளுக்கு மின்னஞ்சல் புதுப்பிப்புகளைப் பெறுங்கள்',
                    'కొత్త స్కాలర్‌షిప్ సమర్పణల కోసం ఈమెయిల్ అప్‌డేట్‌లు పొందండి'
                  )}
                </div>
              </div>
            </div>
            <span className="text-xs text-text-secondary bg-gray-200 px-2 py-1 rounded">
              {t('Coming Soon', 'जल्द आ रहा है', 'விரைவில் வருகிறது', 'త్వరలో వస్తోంది')}
            </span>
          </div>
        </div>
      </Card>

      {/* Security Settings (Placeholder) */}
      <Card padding="lg">
        <CardHeader
          title={t('Security', 'सुरक्षा', 'பாதுகாப்பு', 'భద్రత')}
          subtitle={t(
            'Manage security and access settings',
            'सुरक्षा और एक्सेस सेटिंग्स प्रबंधित करें',
            'பாதுகாப்பு மற்றும் அணுகல் அமைப்புகளை நிர்வகிக்கவும்',
            'భద్రత మరియు యాక్సెస్ సెట్టింగ్‌లను నిర్వహించండి'
          )}
          className="mb-4"
        />
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="w-5 h-5 text-text-secondary" />
              <div>
                <div className="text-sm font-medium text-text-primary">
                  {t(
                    'Two-Factor Authentication',
                    'दो-कारक प्रमाणीकरण',
                    'இரு-காரணி அங்கீகாரம்',
                    'రెండు-అంశాల ప్రామాణీకరణ'
                  )}
                </div>
                <div className="text-xs text-text-secondary">
                  {t(
                    'Add an extra layer of security to your account',
                    'अपने खाते में सुरक्षा की एक अतिरिक्त परत जोड़ें',
                    'உங்கள் கணக்கில் கூடுதல் பாதுகாப்பு அடுக்கைச் சேர்க்கவும்',
                    'మీ ఖాతాకు అదనపు భద్రతా పొరను జోడించండి'
                  )}
                </div>
              </div>
            </div>
            <span className="text-xs text-text-secondary bg-gray-200 px-2 py-1 rounded">
              {t('Coming Soon', 'जल्द आ रहा है', 'விரைவில் வருகிறது', 'త్వరలో వస్తోంది')}
            </span>
          </div>
        </div>
      </Card>

      {/* Data Management (Placeholder) */}
      <Card padding="lg">
        <CardHeader
          title={t('Data Management', 'डेटा प्रबंधन', 'தரவு மேலாண்மை', 'డేటా మేనేజ్‌మెంట్')}
          subtitle={t(
            'Export and manage platform data',
            'प्लेटफॉर्म डेटा निर्यात और प्रबंधित करें',
            'தளம் தரவை ஏற்றுமதி செய்து நிர்வகிக்கவும்',
            'ప్లాట్‌ఫారమ్ డేటాను ఎగుమతి చేసి నిర్వహించండి'
          )}
          className="mb-4"
        />
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <DocumentTextIcon className="w-5 h-5 text-text-secondary" />
              <div>
                <div className="text-sm font-medium text-text-primary">
                  {t(
                    'Export Scholarships',
                    'छात्रवृत्तियां निर्यात करें',
                    'உதவித்தொகைகளை ஏற்றுமதி செய்',
                    'స్కాలర్‌షిప్‌లను ఎగుమతి చేయండి'
                  )}
                </div>
                <div className="text-xs text-text-secondary">
                  {t(
                    'Download all scholarships as CSV or JSON',
                    'सभी छात्रवृत्तियों को CSV या JSON के रूप में डाउनलोड करें',
                    'அனைத்து உதவித்தொகைகளையும் CSV அல்லது JSON ஆக பதிவிறக்கவும்',
                    'అన్ని స్కాలర్‌షిప్‌లను CSV లేదా JSON గా డౌన్‌లోడ్ చేయండి'
                  )}
                </div>
              </div>
            </div>
            <span className="text-xs text-text-secondary bg-gray-200 px-2 py-1 rounded">
              {t('Coming Soon', 'जल्द आ रहा है', 'விரைவில் வருகிறது', 'త్వరలో వస్తోంది')}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <DocumentTextIcon className="w-5 h-5 text-text-secondary" />
              <div>
                <div className="text-sm font-medium text-text-primary">
                  {t(
                    'Export Users',
                    'उपयोगकर्ता निर्यात करें',
                    'பயனர்களை ஏற்றுமதி செய்',
                    'యూజర్లను ఎగుమతి చేయండి'
                  )}
                </div>
                <div className="text-xs text-text-secondary">
                  {t(
                    'Download user list as CSV',
                    'उपयोगकर्ता सूची CSV के रूप में डाउनलोड करें',
                    'பயனர் பட்டியலை CSV ஆக பதிவிறக்கவும்',
                    'యూజర్ జాబితాను CSV గా డౌన్‌లోడ్ చేయండి'
                  )}
                </div>
              </div>
            </div>
            <span className="text-xs text-text-secondary bg-gray-200 px-2 py-1 rounded">
              {t('Coming Soon', 'जल्द आ रहा है', 'விரைவில் வருகிறது', 'త్వరలో వస్తోంది')}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
