import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import EmployerLayout from './components/EmployerLayout'
import AuthPage from './pages/AuthPage'
import MainPage from './pages/MainPage'
import ProfilePage from './pages/ProfilePage'
import EmployerDashboard from './pages/EmployerDashboard'
import EmployerJobsPage from './pages/EmployerJobsPage'
import EmployerMessagesPage from './pages/EmployerMessagesPage'
import EmployerWalletPage from './pages/EmployerWalletPage'
import EmployerHistoryPage from './pages/EmployerHistoryPage'

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
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
              <ProtectedRoute>
                <EmployerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<EmployerDashboard />} />
            <Route path="jobs" element={<EmployerJobsPage />} />
            <Route path="messages" element={<EmployerMessagesPage />} />
            <Route path="wallet" element={<EmployerWalletPage />} />
            <Route path="history" element={<EmployerHistoryPage />} />
          </Route>
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
