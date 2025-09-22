import { useState, useEffect } from 'react'

export const useStandaloneAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('traceHerbUser')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('traceHerbUser')
      }
    }
    setLoading(false)
  }, [])

  const login = async (credentials, portalType) => {
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Demo authentication
      if (credentials.username && credentials.password) {
        const userData = {
          id: Date.now(),
          username: credentials.username,
          portalType: portalType,
          loginTime: new Date().toISOString(),
          role: getRoleByPortal(portalType)
        }
        
        setUser(userData)
        localStorage.setItem('traceHerbUser', JSON.stringify(userData))
        setLoading(false)
        return { success: true, user: userData }
      } else {
        setLoading(false)
        return { success: false, error: 'Invalid credentials' }
      }
    } catch (error) {
      setLoading(false)
      return { success: false, error: 'Login failed. Please try again.' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('traceHerbUser')
  }

  const getRoleByPortal = (portalType) => {
    const roleMap = {
      'processor': 'Processor',
      'laboratory': 'Lab Technician',
      'regulatory': 'Regulator',
      'stakeholder': 'Stakeholder',
      'management': 'Manager',
      'farmer': 'Farmer'
    }
    return roleMap[portalType] || 'User'
  }

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  }
}
