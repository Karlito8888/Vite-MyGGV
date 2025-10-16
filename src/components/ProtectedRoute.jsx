import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../utils/useAuth'
import { onboardingService } from '../services/onboardingService'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const [checkingOnboarding, setCheckingOnboarding] = useState(false)
  const [onboardingChecked, setOnboardingChecked] = useState(false)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || onboardingChecked) return

      setCheckingOnboarding(true)
      
      try {
        const result = await onboardingService.getOnboardingStatus(user.id)
        
        if (result.success) {
          setOnboardingCompleted(result.onboardingCompleted)
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error)
      } finally {
        setCheckingOnboarding(false)
        setOnboardingChecked(true)
      }
    }

    checkOnboardingStatus()
  }, [user, onboardingChecked])

  if (loading || checkingOnboarding) {
    return (
      <div className="container text-center mt-6">
        <div>Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (onboardingChecked && !onboardingCompleted) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

export default ProtectedRoute