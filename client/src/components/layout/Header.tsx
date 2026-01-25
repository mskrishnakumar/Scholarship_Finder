import { Bars3Icon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import LanguageToggle from '../LanguageToggle'

export interface HeaderProps {
  title: string
  onMenuClick: () => void
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const { t } = useLanguage()
  const { profile } = useAuth()

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      {/* Left side - Mobile menu button and title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={t('Open menu', 'मेनू खोलें', 'மெனுவைத் திற', 'మెనూ తెరవండి')}
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 truncate">
          {title}
        </h1>
      </div>

      {/* Right side - Language toggle and user menu */}
      <div className="flex items-center gap-4">
        <LanguageToggle />

        {/* User avatar/menu area */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {profile?.name ? (
              <span className="text-sm font-medium text-gray-600">
                {profile.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <UserCircleIcon className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
            {profile?.name || t('User', 'उपयोगकर्ता', 'பயனர்', 'యూజర్')}
          </span>
        </div>
      </div>
    </header>
  )
}
