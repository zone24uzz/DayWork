import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const getDashboardPath = (userType) => {
  if (userType === 'employer') return '/employer'
  if (userType === 'worker') return '/worker'
  return '/login'
}

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2]">
    <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
  </div>
)

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) return <LoadingScreen />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Role-based access: if allowedRole is specified and user doesn't match, redirect
  if (allowedRole && user.userType !== allowedRole) {
    return <Navigate to={getDashboardPath(user.userType)} replace />
  }

  return children
}

export const GuestRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) return <LoadingScreen />

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.userType)} replace />
  }

  return children
}

export default ProtectedRoute
