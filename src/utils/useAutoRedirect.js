import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useAuth } from './useAuth'

/**
 * Hook to handle auto-redirect notifications after location approval
 * Checks for redirect_to_home flag and shows notification
 */
export function useAutoRedirect() {
  const { user } = useAuth()
  const [hasShownNotification, setHasShownNotification] = useState(false)

  useEffect(() => {
    if (!user || hasShownNotification) return

    const checkRedirectFlag = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('redirect_to_home')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error checking redirect flag:', error)
          return
        }

        if (data?.redirect_to_home === true) {
          // Show notification
          alert('🎉 Great news! Your location request has been approved!')
          
          // Clear the flag
          const { error: clearError } = await supabase
            .from('profiles')
            .update({ redirect_to_home: false })
            .eq('id', user.id)

          if (clearError) {
            console.error('Error clearing redirect flag:', clearError)
          }

          setHasShownNotification(true)
        }
      } catch (err) {
        console.error('Error in useAutoRedirect:', err)
      }
    }

    checkRedirectFlag()

    // Also listen for realtime updates
    const channel = supabase
      .channel('profile-redirect-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new?.redirect_to_home === true && !hasShownNotification) {
            alert('🎉 Great news! Your location request has been approved!')
            
            // Clear the flag
            supabase
              .from('profiles')
              .update({ redirect_to_home: false })
              .eq('id', user.id)
              .then(() => setHasShownNotification(true))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, hasShownNotification])
}
