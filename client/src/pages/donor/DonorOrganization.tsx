import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { Card, CardHeader } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import {
  BuildingOfficeIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  PhoneIcon,
  PencilIcon,
} from '@heroicons/react/24/outline'

interface OrganizationData {
  name: string
  description: string
  website: string
  email: string
  phone: string
}

export default function DonorOrganization() {
  const { t } = useLanguage()
  const { profile } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<OrganizationData>({
    name: '',
    description: '',
    website: '',
    email: '',
    phone: '',
  })
  const [savedData, setSavedData] = useState<OrganizationData>({
    name: '',
    description: '',
    website: '',
    email: '',
    phone: '',
  })

  // Load organization data from profile or localStorage
  useEffect(() => {
    const storedOrg = localStorage.getItem('donorOrganization')
    if (storedOrg) {
      try {
        const parsed = JSON.parse(storedOrg)
        setFormData(parsed)
        setSavedData(parsed)
      } catch {
        // Ignore parse errors
      }
    } else if (profile?.name) {
      const initial = {
        name: profile.name,
        description: '',
        website: '',
        email: profile.email || '',
        phone: '',
      }
      setFormData(initial)
      setSavedData(initial)
    }
  }, [profile])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Save to localStorage (in a real app, this would be an API call)
      localStorage.setItem('donorOrganization', JSON.stringify(formData))
      setSavedData(formData)
      setIsEditing(false)
    } catch {
      // Handle error silently
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData(savedData)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t(
              'Organization Profile',
              'संगठन प्रोफ़ाइल',
              'நிறுவன சுயவிவரம்',
              'సంస్థ ప్రొఫైల్'
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t(
              'Manage your organization information',
              'अपनी संगठन जानकारी प्रबंधित करें',
              'உங்கள் நிறுவன தகவலை நிர்வகிக்கவும்',
              'మీ సంస్థ సమాచారాన్ని నిర్వహించండి'
            )}
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="secondary">
            <PencilIcon className="w-4 h-4 mr-2" />
            {t('Edit', 'संपादित करें', 'திருத்து', 'సవరించు')}
          </Button>
        )}
      </div>

      {/* Organization Card */}
      <Card padding="lg">
        {isEditing ? (
          /* Edit Mode */
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t(
                  'Organization Name',
                  'संगठन का नाम',
                  'நிறுவன பெயர்',
                  'సంస్థ పేరు'
                )}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                placeholder={t(
                  'Enter organization name',
                  'संगठन का नाम दर्ज करें',
                  'நிறுவன பெயரை உள்ளிடவும்',
                  'సంస్థ పేరు నమోదు చేయండి'
                )}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('Description', 'विवरण', 'விளக்கம்', 'వివరణ')}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                placeholder={t(
                  'Describe your organization and its mission',
                  'अपने संगठन और इसके मिशन का वर्णन करें',
                  'உங்கள் நிறுவனம் மற்றும் அதன் நோக்கத்தை விவரிக்கவும்',
                  'మీ సంస్థ మరియు దాని లక్ష్యాన్ని వివరించండి'
                )}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('Website', 'वेबसाइट', 'இணையதளம்', 'వెబ్‌సైట్')}
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                placeholder="https://example.com"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Email', 'ईमेल', 'மின்னஞ்சல்', 'ఇమెయిల్')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  placeholder="contact@organization.com"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Phone', 'फ़ोन', 'தொலைபேசி', 'ఫోన్')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  placeholder="+91 98765 43210"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={handleCancel} disabled={loading}>
                {t('Cancel', 'रद्द करें', 'ரத்து செய்', 'రద్దు చేయి')}
              </Button>
              <Button onClick={handleSave} isLoading={loading}>
                {t(
                  'Save Changes',
                  'परिवर्तन सहेजें',
                  'மாற்றங்களைச் சேமி',
                  'మార్పులు సేవ్ చేయి'
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="space-y-6">
            {/* Organization Header */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <BuildingOfficeIcon className="w-8 h-8 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900">
                  {savedData.name ||
                    t(
                      'Organization Name',
                      'संगठन का नाम',
                      'நிறுவன பெயர்',
                      'సంస్థ పేరు'
                    )}
                </h2>
                {savedData.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {savedData.description}
                  </p>
                )}
                {!savedData.description && (
                  <p className="text-sm text-gray-400 mt-2 italic">
                    {t(
                      'No description provided',
                      'कोई विवरण नहीं दिया गया',
                      'விளக்கம் வழங்கப்படவில்லை',
                      'వివరణ అందించబడలేదు'
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                {t(
                  'Contact Information',
                  'संपर्क जानकारी',
                  'தொடர்பு தகவல்',
                  'సంప్రదింపు సమాచారం'
                )}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GlobeAltIcon className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">
                      {t('Website', 'वेबसाइट', 'இணையதளம்', 'వెబ్‌సైట్')}
                    </p>
                    {savedData.website ? (
                      <a
                        href={savedData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-amber-600 hover:text-amber-700 truncate block"
                      >
                        {savedData.website}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-400 italic">
                        {t('Not provided', 'प्रदान नहीं किया गया', 'வழங்கப்படவில்லை', 'అందించబడలేదు')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <EnvelopeIcon className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">
                      {t('Email', 'ईमेल', 'மின்னஞ்சல்', 'ఇమెయిల్')}
                    </p>
                    {savedData.email ? (
                      <a
                        href={`mailto:${savedData.email}`}
                        className="text-sm text-amber-600 hover:text-amber-700 truncate block"
                      >
                        {savedData.email}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-400 italic">
                        {t('Not provided', 'प्रदान नहीं किया गया', 'வழங்கப்படவில்லை', 'అందించబడలేదు')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PhoneIcon className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">
                      {t('Phone', 'फ़ोन', 'தொலைபேசி', 'ఫోన్')}
                    </p>
                    {savedData.phone ? (
                      <a
                        href={`tel:${savedData.phone}`}
                        className="text-sm text-amber-600 hover:text-amber-700"
                      >
                        {savedData.phone}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-400 italic">
                        {t('Not provided', 'प्रदान नहीं किया गया', 'வழங்கப்படவில்லை', 'అందించబడలేదు')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
