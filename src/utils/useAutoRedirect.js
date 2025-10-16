import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { onboardingService } from '../services/onboardingService'

export function useAutoRedirect() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    if (!user) return

    const checkForRedirect = async () => {
      setIsChecking(true)
      
      try {
        const needsRedirect = await onboardingService.checkRedirectNeeded(user.id)
        
        if (needsRedirect) {
          // Clear the redirect flag
          await onboardingService.clearRedirectFlag(user.id)
          
          // Redirect to home
          navigate('/home', { replace: true })
        }
      } catch (error) {
        console.error('Error checking redirect status:', error)
      } finally {
        setIsChecking(false)
      }
    }

    // Check immediately
    checkForRedirect()

    // Set up interval to check periodically (every 5 seconds)
    const interval = setInterval(checkForRedirect, 5000)

    return () => clearInterval(interval)
  }, [user, navigate])

  return { isChecking }
}