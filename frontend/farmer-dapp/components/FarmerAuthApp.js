import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

// Lazy-load the main portal to keep auth screen light
const WorkingFarmerPortal = dynamic(() => import('./WorkingFarmerPortal'), { ssr: false })

export default function FarmerAuthApp() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authView, setAuthView] = useState('login') // 'login' | 'signup'
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
    // Simple auth check
    try {
      const storedUser = localStorage.getItem('traceherb_user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    }
    setLoading(false)
  }, [])

  const handleLogin = async (credentials) => {
    setLoading(true)
    try {
      // Simple demo login
      const demoUser = {
        id: 'farmer_' + Date.now(),
        email: credentials.email,
        firstName: 'Demo',
        lastName: 'Farmer',
        role: 'farmer',
        farmName: 'Demo Farm',
        farmLocation: 'Demo Location'
      }
      localStorage.setItem('traceherb_user', JSON.stringify(demoUser))
      setUser(demoUser)
    } catch (error) {
      alert('Login failed: ' + error.message)
    }
    setLoading(false)
  }

  const handleSignup = async (formData) => {
    setLoading(true)
    try {
      // Simple demo signup
      const newUser = {
        id: 'farmer_' + Date.now(),
        ...formData,
        role: 'farmer'
      }
      localStorage.setItem('traceherb_user', JSON.stringify(newUser))
      setUser(newUser)
    } catch (error) {
      alert('Signup failed: ' + error.message)
    }
    setLoading(false)
  }

  const logout = () => {
    localStorage.removeItem('traceherb_user')
    setUser(null)
  }

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = { ...user, ...profileData }
      localStorage.setItem('traceherb_user', JSON.stringify(updatedUser))
      setUser(updatedUser)
    } catch (error) {
      console.error('Profile update error:', error)
    }
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #10b981',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '18px' }}>Loading Farmer Portal...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return authView === 'login' ? (
      <LoginForm
        onLogin={handleLogin}
        onSwitchToSignup={() => setAuthView('signup')}
        portalName="TRACE HERB - Farmer Portal"
        portalIcon="🧑‍🌾"
        loading={loading}
      />
    ) : (
      <SignupForm
        onSignup={handleSignup}
        onSwitchToLogin={() => setAuthView('login')}
        loading={loading}
      />
    )
  }

  return (
    <WorkingFarmerPortal
      user={user}
      onLogout={logout}
      onUpdateProfile={updateProfile}
    />
  )
}

