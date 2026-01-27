import {
  HomeIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  DocumentTextIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  PlusCircleIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import type { ComponentType, SVGProps } from 'react'

export interface MenuItem {
  id: string
  label: string
  labelHi?: string
  labelTa?: string
  labelTe?: string
  path: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  badge?: number | string
  end?: boolean // For NavLink end prop - exact path matching
  note?: string // Optional note to display below label
  noteHi?: string
  noteTa?: string
  noteTe?: string
}

export interface MenuConfig {
  main: MenuItem[]
  secondary: MenuItem[]
}

export const studentMenuConfig: MenuConfig = {
  main: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      labelHi: 'डैशबोर्ड',
      labelTa: 'டாஷ்போர்டு',
      labelTe: 'డాష్‌బోర్డ్',
      path: '/student',
      icon: HomeIcon,
      end: true, // Exact match only - won't highlight for /student/search etc
    },
    {
      id: 'recommendations',
      label: 'Recommendations',
      labelHi: 'सिफारिशें',
      labelTa: 'பரிந்துரைகள்',
      labelTe: 'సిఫారసులు',
      path: '/student/recommendations',
      icon: SparklesIcon,
      note: 'Based on your profile',
      noteHi: 'आपकी प्रोफ़ाइल के आधार पर',
      noteTa: 'உங்கள் சுயவிவரத்தின் அடிப்படையில்',
      noteTe: 'మీ ప్రొఫైల్ ఆధారంగా',
    },
    {
      id: 'search',
      label: 'Find Scholarships',
      labelHi: 'छात्रवृत्ति खोजें',
      labelTa: 'உதவித்தொகைகளைக் கண்டறியுங்கள்',
      labelTe: 'స్కాలర్‌షిప్‌లు కనుగొనండి',
      path: '/student/search',
      icon: MagnifyingGlassIcon,
    },
    {
      id: 'chat',
      label: 'Chat Assistant',
      labelHi: 'चैट सहायक',
      labelTa: 'அரட்டை உதவியாளர்',
      labelTe: 'చాట్ అసిస్టెంట్',
      path: '/student/chat',
      icon: ChatBubbleLeftRightIcon,
    },
    {
      id: 'saved',
      label: 'Saved',
      labelHi: 'सहेजे गए',
      labelTa: 'சேமிக்கப்பட்டவை',
      labelTe: 'సేవ్ చేసినవి',
      path: '/student/saved',
      icon: BookmarkIcon,
    },
    {
      id: 'applications',
      label: 'Applications',
      labelHi: 'आवेदन',
      labelTa: 'விண்ணப்பங்கள்',
      labelTe: 'అప్లికేషన్లు',
      path: '/student/applications',
      icon: DocumentTextIcon,
    },
  ],
  secondary: [
    {
      id: 'profile',
      label: 'Profile',
      labelHi: 'प्रोफ़ाइल',
      labelTa: 'சுயவிவரம்',
      labelTe: 'ప్రొఫైల్',
      path: '/student/profile',
      icon: UserCircleIcon,
    },
    {
      id: 'settings',
      label: 'Settings',
      labelHi: 'सेटिंग्स',
      labelTa: 'அமைப்புகள்',
      labelTe: 'సెట్టింగ్‌లు',
      path: '/student/settings',
      icon: Cog6ToothIcon,
    },
  ],
}

export const donorMenuConfig: MenuConfig = {
  main: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      labelHi: 'डैशबोर्ड',
      labelTa: 'டாஷ்போர்டு',
      labelTe: 'డాష్‌బోర్డ్',
      path: '/donor',
      icon: HomeIcon,
      end: true,
    },
    {
      id: 'create',
      label: 'Create Scholarship',
      labelHi: 'छात्रवृत्ति बनाएं',
      labelTa: 'உதவித்தொகை உருவாக்கு',
      labelTe: 'స్కాలర్‌షిప్ సృష్టించు',
      path: '/donor/scholarships/new',
      icon: PlusCircleIcon,
    },
    {
      id: 'scholarships',
      label: 'My Scholarships',
      labelHi: 'मेरी छात्रवृत्तियां',
      labelTa: 'எனது உதவித்தொகைகள்',
      labelTe: 'నా స్కాలర్‌షిప్‌లు',
      path: '/donor/scholarships',
      icon: ClipboardDocumentListIcon,
      end: true,
    },
  ],
  secondary: [
    {
      id: 'organization',
      label: 'Organization',
      labelHi: 'संगठन',
      labelTa: 'நிறுவனம்',
      labelTe: 'సంస్థ',
      path: '/donor/organization',
      icon: UserCircleIcon,
    },
    {
      id: 'settings',
      label: 'Settings',
      labelHi: 'सेटिंग्स',
      labelTa: 'அமைப்புகள்',
      labelTe: 'సెట్టింగ్‌లు',
      path: '/donor/settings',
      icon: Cog6ToothIcon,
    },
  ],
}

export const adminMenuConfig: MenuConfig = {
  main: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      labelHi: 'डैशबोर्ड',
      labelTa: 'டாஷ்போர்டு',
      labelTe: 'డாష్‌బోర్డ్',
      path: '/admin',
      icon: HomeIcon,
      end: true,
    },
    {
      id: 'scholarships',
      label: 'Scholarships',
      labelHi: 'छात्रवृत्तियां',
      labelTa: 'உதவித்தொகைகள்',
      labelTe: 'స్కాలర్‌షిప్‌లు',
      path: '/admin/scholarships',
      icon: ClipboardDocumentListIcon,
    },
    {
      id: 'users',
      label: 'Users',
      labelHi: 'उपयोगकर्ता',
      labelTa: 'பயனர்கள்',
      labelTe: 'యూజర్లు',
      path: '/admin/users',
      icon: UsersIcon,
    },
    {
      id: 'pending',
      label: 'Pending Approval',
      labelHi: 'लंबित अनुमोदन',
      labelTa: 'நிலுவையில் உள்ள அங்கீகாரம்',
      labelTe: 'పెండింగ్ ఆమోదం',
      path: '/admin/pending',
      icon: ClockIcon,
    },
  ],
  secondary: [
    {
      id: 'settings',
      label: 'Settings',
      labelHi: 'सेटिंग्स',
      labelTa: 'அமைப்புகள்',
      labelTe: 'సెట్టింగ్‌లు',
      path: '/admin/settings',
      icon: Cog6ToothIcon,
    },
  ],
}

export function getMenuConfig(role: 'student' | 'donor' | 'admin'): MenuConfig {
  switch (role) {
    case 'student':
      return studentMenuConfig
    case 'donor':
      return donorMenuConfig
    case 'admin':
      return adminMenuConfig
    default:
      return studentMenuConfig
  }
}
