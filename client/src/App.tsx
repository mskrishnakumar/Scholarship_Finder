import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import type { UserRole } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage, { LoginRedirect } from './pages/LoginPage'
import StudentOnboarding from './pages/StudentOnboarding'
import StudentDashboard from './pages/StudentDashboard'
import DonorDashboard from './pages/DonorDashboard'
import AdminDashboard from './pages/AdminDashboard'

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
            <Route path="/" element={<LandingPage />} />
            {/* Role-specific login routes */}
            <Route path="/login/student" element={<LoginPage pageRole="student" />} />
            <Route path="/login/donor" element={<LoginPage pageRole="donor" />} />
            <Route path="/login/admin" element={<LoginPage pageRole="admin" />} />
            {/* Backward-compat: /login?role=X redirects to /login/X */}
            <Route path="/login" element={<LoginRedirect />} />
            <Route path="/student/onboarding" element={
              <RoleProtectedRoute allowedRoles={['student']}>
                <StudentOnboarding />
              </RoleProtectedRoute>
            } />
            <Route path="/student" element={
              <RoleProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </RoleProtectedRoute>
            } />
            <Route path="/donor" element={
              <RoleProtectedRoute allowedRoles={['donor']}>
                <DonorDashboard />
              </RoleProtectedRoute>
            } />
            <Route path="/admin" element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  )
}
