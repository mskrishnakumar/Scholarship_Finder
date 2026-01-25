import { NavLink, useNavigate } from 'react-router-dom'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { getMenuConfig } from './menuConfig'
import type { MenuItem } from './menuConfig'

export interface SidebarProps {
  role: 'student' | 'donor' | 'admin'
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export default function Sidebar({ role, isCollapsed, onToggleCollapse }: SidebarProps) {
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const { signOut, profile } = useAuth()

  const menuConfig = getMenuConfig(role)

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const getLocalizedLabel = (item: MenuItem): string => {
    switch (language) {
      case 'hi':
        return item.labelHi || item.label
      case 'ta':
        return item.labelTa || item.label
      case 'te':
        return item.labelTe || item.label
      default:
        return item.label
    }
  }

  // Role-based color schemes
  const getActiveClasses = (): string => {
    if (role === 'donor') {
      return 'bg-amber-100 text-amber-600'
    }
    return 'bg-teal-100 text-teal-600'
  }

  const getInactiveClasses = (): string => {
    return 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
  }

  const getLogoBackground = (): string => {
    if (role === 'donor') {
      return 'bg-amber-500'
    }
    return 'bg-teal-700'
  }

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon

    return (
      <NavLink
        key={item.id}
        to={item.path}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            isActive ? getActiveClasses() : getInactiveClasses()
          }`
        }
        title={isCollapsed ? getLocalizedLabel(item) : undefined}
      >
        <Icon className="w-5 h-5 shrink-0" />
        {!isCollapsed && (
          <span className="text-sm font-medium truncate flex-1">
            {getLocalizedLabel(item)}
          </span>
        )}
        {!isCollapsed && item.badge !== undefined && (
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium bg-red-500 text-white rounded-full">
            {item.badge}
          </span>
        )}
        {isCollapsed && item.badge !== undefined && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </NavLink>
    )
  }

  return (
    <aside
      className={`flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
        <div
          className={`w-8 h-8 ${getLogoBackground()} rounded-lg flex items-center justify-center shrink-0`}
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
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
          </svg>
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-gray-900 truncate">
              {t('Mission Possible', 'मिशन पॉसिबल', 'மிஷன் பாசிபிள்', 'మిషన్ పాసిబుల్')}
            </h1>
            {profile?.name && (
              <p className="text-xs text-gray-500 truncate">{profile.name}</p>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Main menu items */}
        <div className="space-y-1">
          {menuConfig.main.map(renderMenuItem)}
        </div>

        {/* Secondary menu items */}
        {menuConfig.secondary.length > 0 && (
          <>
            <div className="my-4 border-t border-gray-200" />
            <div className="space-y-1">
              {menuConfig.secondary.map(renderMenuItem)}
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 px-3 py-3">
        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-500 hover:bg-gray-50 hover:text-gray-800 rounded-lg transition-colors mb-2"
          title={isCollapsed ? t('Expand', 'विस्तार करें', 'விரிவாக்கு', 'విస్తరించు') : t('Collapse', 'संक्षिप्त करें', 'சுருக்கு', 'కుదించు')}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeftIcon className="w-5 h-5" />
              <span className="text-sm font-medium">
                {t('Collapse', 'संक्षिप्त करें', 'சுருக்கு', 'కుదించు')}
              </span>
            </>
          )}
        </button>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${getInactiveClasses()}`}
          title={isCollapsed ? t('Logout', 'लॉगआउट', 'வெளியேறு', 'లాగ్అవుట్') : undefined}
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 shrink-0" />
          {!isCollapsed && (
            <span className="text-sm font-medium">
              {t('Logout', 'लॉगआउट', 'வெளியேறு', 'లాగ్అవుట్')}
            </span>
          )}
        </button>
      </div>
    </aside>
  )
}
