import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import type { UserRole } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage, { LoginRedirect } from './pages/LoginPage'
import AuthCallback from './pages/AuthCallback'
import StudentOnboarding from './pages/StudentOnboarding'
import NotFound from './pages/NotFound'
import DashboardLayout from './components/layout/DashboardLayout'

// Student pages
import {
  StudentDashboard,
  StudentProfile,
  StudentRecommendations,
  StudentSearch,
  StudentChat,
  StudentSettings,
  StudentSaved,
  StudentApplications,
} from './pages/student'

// Donor pages
import {
  DonorDashboard,
  DonorScholarships,
  DonorScholarshipForm,
  DonorOrganization,
  DonorSettings,
} from './pages/donor'

// Admin pages
import {
  AdminDashboard,
  AdminScholarships,
  AdminPending,
  AdminUsers,
  AdminSettings,
} from './pages/admin'

const ROLE_HOME: Record<UserRole, string> = {
  student: '/student',
  donor: '/donor',
  admin: '/admin'
}

function RoleProtectedRoute({ allowedRoles, children }: { allowedRoles: UserRole[]; children: React.ReactNode }) {
  const { user, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login/student" replace />
  }

  if (role && !allowedRoles.includes(role)) {
    return <Navigate to={ROLE_HOME[role]} replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />

            {/* Role-specific login routes */}
            <Route path="/login/student" element={<LoginPage pageRole="student" />} />
            <Route path="/login/donor" element={<LoginPage pageRole="donor" />} />
            <Route path="/login/admin" element={<LoginPage pageRole="admin" />} />
            {/* Backward-compat: /login?role=X redirects to /login/X */}
            <Route path="/login" element={<LoginRedirect />} />

            {/* OAuth callback route */}
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Student onboarding (standalone, no dashboard layout) */}
            <Route path="/student/onboarding" element={
              <RoleProtectedRoute allowedRoles={['student']}>
                <StudentOnboarding />
              </RoleProtectedRoute>
            } />

            {/* Student routes with DashboardLayout */}
            <Route path="/student" element={
              <RoleProtectedRoute allowedRoles={['student']}>
                <DashboardLayout role="student" />
              </RoleProtectedRoute>
            }>
              <Route index element={<StudentDashboard />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="recommendations" element={<StudentRecommendations />} />
              <Route path="search" element={<StudentSearch />} />
              <Route path="saved" element={<StudentSaved />} />
              <Route path="applications" element={<StudentApplications />} />
              <Route path="chat" element={<StudentChat />} />
              <Route path="settings" element={<StudentSettings />} />
            </Route>

            {/* Donor routes with DashboardLayout */}
            <Route path="/donor" element={
              <RoleProtectedRoute allowedRoles={['donor']}>
                <DashboardLayout role="donor" />
              </RoleProtectedRoute>
            }>
              <Route index element={<DonorDashboard />} />
              <Route path="scholarships" element={<DonorScholarships />} />
              <Route path="scholarships/new" element={<DonorScholarshipForm />} />
              <Route path="scholarships/:id" element={<DonorScholarshipForm />} />
              <Route path="organization" element={<DonorOrganization />} />
              <Route path="settings" element={<DonorSettings />} />
            </Route>

            {/* Admin routes with DashboardLayout */}
            <Route path="/admin" element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout role="admin" />
              </RoleProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="scholarships" element={<AdminScholarships />} />
              <Route path="pending" element={<AdminPending />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* 404 catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  )
}
