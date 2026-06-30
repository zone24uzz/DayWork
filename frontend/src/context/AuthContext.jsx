import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

const API_URL = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = 'daywork_token'
const USER_KEY = 'daywork_user'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      const storedUser = localStorage.getItem(USER_KEY)
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
    setLoading(false)
  }, [])

  const apiCall = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })

    let data
    try {
      data = await response.json()
    } catch {
      if (!response.ok) {
        throw new Error(`Xatolik yuz berdi (${response.status})`)
      }
      throw new Error('Serverdan noto\'g\'ri javob keldi')
    }

    if (!response.ok) {
      throw new Error(data.message || `Xatolik yuz berdi (${response.status})`)
    }
    return data
  }

  const register = async (formData) => {
    const data = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData),
    })
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    return data
  }

  const login = async (email, password) => {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    return data
  }

  // ── Onboarding (tri-state: null=loading, false=not_seen, true=seen) ──
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    const localSeen = localStorage.getItem('daywork_onboarding_seen')
    if (localSeen === 'true') return true
    // For authenticated users with no local flag, check backend first → null (loading)
    // For guest users with no flag → false immediately (no flash)
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (storedToken) return null // need backend check
    return false // guest user, show onboarding immediately
  })

  // Check onboarding status from backend for authenticated users
  useEffect(() => {
    if (isAuthenticated && token && hasSeenOnboarding !== true) {
      apiCall('/auth/onboarding')
        .then((data) => {
          if (data.hasSeenOnboarding) {
            setHasSeenOnboarding(true)
            localStorage.setItem('daywork_onboarding_seen', 'true')
          } else {
            setHasSeenOnboarding(false)
          }
        })
        .catch(() => {
          // Backend check failed, default to not seen for guest-like flow
          setHasSeenOnboarding(false)
        })
    } else if (!isAuthenticated && hasSeenOnboarding === null) {
      // Non-authenticated users without local flag → not seen
      setHasSeenOnboarding(false)
    }
  }, [isAuthenticated, token, hasSeenOnboarding])

  const markOnboardingSeen = async () => {
    setHasSeenOnboarding(true)
    localStorage.setItem('daywork_onboarding_seen', 'true')
    
    if (token) {
      try {
        await apiCall('/auth/onboarding', { method: 'POST' })
      } catch (err) {
        console.error('Failed to sync onboarding status:', err)
      }
    }
  }

  const updateProfile = async (profileData) => {
    const data = await apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
    setUser(data.user)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    return data
  }

  const changePassword = async (currentPassword, newPassword) => {
    return await apiCall('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      apiCall,
      isAuthenticated: !!user,
      hasSeenOnboarding,
      markOnboardingSeen,
    }}>
      {children}
    </AuthContext.Provider>
  )
}