import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import Sidebar from './Sidebar'
import Header from './Header'
import { getMenuConfig } from './menuConfig'

export interface DashboardLayoutProps {
  role: 'student' | 'donor' | 'admin'
}

export default function DashboardLayout({ role }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()
  const { t } = useLanguage()

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  // Close mobile sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileOpen])

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => !prev)
  }

  const handleMobileMenuClick = () => {
    setIsMobileOpen(true)
  }

  const handleCloseMobileMenu = () => {
    setIsMobileOpen(false)
  }

  // Get page title based on current route
  const getPageTitle = (): string => {
    const menuConfig = getMenuConfig(role)
    const allItems = [...menuConfig.main, ...menuConfig.secondary]
    const currentItem = allItems.find((item) => item.path === location.pathname)

    if (currentItem) {
      return currentItem.label
    }

    // Default titles based on role
    switch (role) {
      case 'student':
        return t('Student Dashboard', 'छात्र डैशबोर्ड', 'மாணவர் டாஷ்போர்டு', 'విద్యార్థి డాష్‌బోర్డ్')
      case 'donor':
        return t('Donor Dashboard', 'दाता डैशबोर्ड', 'நன்கொடையாளர் டாஷ்போர்டு', 'డోనర్ డాష్‌బోర్డ్')
      case 'admin':
        return t('Admin Dashboard', 'व्यवस्थापक डैशबोर्ड', 'நிர்வாகி டாஷ்போர்டு', 'అడ్మిన్ డాష్‌బోర్డ్')
      default:
        return t('Dashboard', 'डैशबोर्ड', 'டாஷ்போர்டு', 'డాష్‌బోర్డ్')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar - fixed position */}
      <div
        className={`hidden lg:block fixed inset-y-0 left-0 z-50 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        <Sidebar
          role={role}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={handleCloseMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar - slide in from left */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-60 transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          role={role}
          isCollapsed={false}
          onToggleCollapse={() => {}}
        />
      </div>

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-60'
        }`}
      >
        {/* Header */}
        <Header title={getPageTitle()} onMenuClick={handleMobileMenuClick} />

        {/* Page Content */}
        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
