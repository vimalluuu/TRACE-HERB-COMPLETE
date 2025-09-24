import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useStandaloneAuth } from '../hooks/useAuth'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

// Lazy-load the main portal to keep auth screen light
const WorkingFarmerPortal = dynamic(() => import('./WorkingFarmerPortal'), { ssr: false })

export default function FarmerAuthApp() {
  const { user, loading, login, signup, updateProfile, logout, isAuthenticated } = useStandaloneAuth()
  const [authView, setAuthView] = useState('login') // 'login' | 'signup'

  const handleLogin = async (credentials) => {
    const res = await login(credentials, 'farmer')
    if (!res?.success) {
      alert(res?.error || 'Login failed')
    }
  }

  const handleSignup = async (formData) => {
    const res = await signup(formData)
    if (!res?.success) {
      alert(res?.error || 'Signup failed')
    }
  }

  if (!isAuthenticated) {
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

