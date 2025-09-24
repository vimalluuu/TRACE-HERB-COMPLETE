import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useStandaloneAuth } from '../hooks/useAuth'
import LoginForm from '../components/LoginForm'
import SignupForm from '../components/SignupForm'
import WorkingFarmerPortal from '../components/WorkingFarmerPortal'

export default function FarmerDApp() {
  // Authentication
  const { user, loading: authLoading, login, signup, updateProfile, logout } = useStandaloneAuth()
  const [showSignup, setShowSignup] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)

  // Login handler
  const handleLogin = async (credentials) => {
    setLoginLoading(true)
    try {
      const result = await login(credentials, 'farmer')
      if (!result.success) {
        alert(result.error || 'Login failed')
      }
    } catch (error) {
      alert('Login failed. Please try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  // Signup handler
  const handleSignup = async (formData) => {
    setLoginLoading(true)
    try {
      const result = await signup(formData)
      if (result.success) {
        setShowSignup(false)
      } else {
        alert(result.error || 'Signup failed')
      }
    } catch (error) {
      alert('Signup failed. Please try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  // Profile update handler
  const handleUpdateProfile = async (profileData) => {
    try {
      const result = await updateProfile(profileData)
      if (result.success) {
        alert('Profile updated successfully!')
      } else {
        alert(result.error || 'Profile update failed')
      }
    } catch (error) {
      alert('Profile update failed. Please try again.')
    }
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="mobile-container bg-gradient-to-br from-herb-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-herb-green-600 mx-auto mb-4"></div>
          <p className="text-herb-green-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login/signup forms if user is not authenticated
  if (!user) {
    if (showSignup) {
      return (
        <>
          <Head>
            <title>TRACE HERB - Farmer Registration</title>
            <meta name="description" content="Register as a farmer to access the collection portal" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </Head>
          <SignupForm
            onSignup={handleSignup}
            onSwitchToLogin={() => setShowSignup(false)}
            loading={loginLoading}
          />
        </>
      )
    }

    return (
      <>
        <Head>
          <title>TRACE HERB - Farmer Portal Login</title>
          <meta name="description" content="Login to access the farmer collection portal" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="theme-color" content="#16a34a" />
          <link rel="manifest" href="/manifest.json" />
        </Head>
        <LoginForm
          onLogin={handleLogin}
          onSwitchToSignup={() => setShowSignup(true)}
          loading={loginLoading}
        />
      </>
    )
  }

  // Show WorkingFarmerPortal for authenticated users
  return (
    <>
      <Head>
        <title>TRACE HERB - Farmer Portal</title>
        <meta name="description" content="Farmer portal for herb collection and batch management" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <WorkingFarmerPortal
        user={user}
        onLogout={logout}
        onUpdateProfile={handleUpdateProfile}
      />
    </>
  )
}
