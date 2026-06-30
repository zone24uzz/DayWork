import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'
import ProtectedRoute, { GuestRoute } from './components/ProtectedRoute'
import EmployerLayout from './components/EmployerLayout'
import AuthPage from './pages/AuthPage'
import MainPage from './pages/MainPage'
import ProfilePage from './pages/ProfilePage'
import EmployerDashboard from './pages/EmployerDashboard'
import EmployerJobsPage from './pages/EmployerJobsPage'
import EmployerMessagesPage from './pages/EmployerMessagesPage'
import EmployerWalletPage from './pages/EmployerWalletPage'
import EmployerHistoryPage from './pages/EmployerHistoryPage'
import EmployerPostJobPage from './pages/EmployerPostJobPage'
import WorkerLayout from './components/WorkerLayout'
import WorkerDashboard from './pages/WorkerDashboard'
import WorkerMyJobsPage from './pages/WorkerMyJobsPage'
import WorkerMessagesPage from './pages/WorkerMessagesPage'
import WorkerWalletPage from './pages/WorkerWalletPage'
import WorkerHistoryPage from './pages/WorkerHistoryPage'
import WorkerSearchPage from './pages/WorkerSearchPage'
import Onboarding from './components/Onboarding'

const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.userType === 'employer') return <Navigate to="/employer" replace />
  if (user?.userType === 'worker') return <Navigate to="/worker" replace />
  return <Navigate to="/login" replace />
}

const AppContent = () => {
  const { hasSeenOnboarding, isAuthenticated, loading: authLoading } = useAuth()
  const [onboardingComplete, setOnboardingComplete] = useState(
    () => localStorage.getItem('daywork_onboarding_seen') === 'true'
  )

  const handleOnboardingComplete = () => {
    setOnboardingComplete(true)
  }

  // Wait for auth and onboarding status to resolve before rendering
  // hasSeenOnboarding = null means we're still checking backend
  if (authLoading || hasSeenOnboarding === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2]">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  // Show onboarding on first visit (never seen + not completed this session)
  if (!hasSeenOnboarding && !onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><AuthPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><AuthPage /></GuestRoute>} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <MainPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer"
        element={
          <ProtectedRoute allowedRole="employer">
            <EmployerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EmployerDashboard />} />
        <Route path="jobs" element={<EmployerJobsPage />} />
        <Route path="messages" element={<EmployerMessagesPage />} />
        <Route path="wallet" element={<EmployerWalletPage />} />
        <Route path="history" element={<EmployerHistoryPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="post-job" element={<EmployerPostJobPage />} />
      </Route>
      <Route
        path="/worker"
        element={
          <ProtectedRoute allowedRole="worker">
            <WorkerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<WorkerDashboard />} />
        <Route path="my-jobs" element={<WorkerMyJobsPage />} />
        <Route path="messages" element={<WorkerMessagesPage />} />
        <Route path="wallet" element={<WorkerWalletPage />} />
        <Route path="history" element={<WorkerHistoryPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="search" element={<WorkerSearchPage />} />
      </Route>
      <Route path="/profile" element={<Navigate to="/employer/profile" replace />} />
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
