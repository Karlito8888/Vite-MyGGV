import { createContext, useState, useEffect, useContext } from 'react'
import { supabase } from '../utils/supabase'
import { getCurrentUserWithClaims } from '../utils/authHelpers'

/* eslint-disable react-refresh/only-export-components */
export const UserContext = createContext()

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('UserContext: Initializing authentication...')
      try {
        const { user: authUser, method, error } = await getCurrentUserWithClaims()
        console.log('UserContext: Initial auth check result:', { user: authUser, method, error })
        if (authUser) {
          console.log('UserContext: User found during initialization:', authUser)
        }
        setUser(authUser)
      } catch (error) {
        console.error('UserContext: Error initializing auth:', error)
        setUser(null)
      } finally {
        console.log('UserContext: Initialization complete, loading set to false')
        setLoading(false)
        setInitialized(true)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('UserContext: Auth state changed:', { event, hasSession: !!session, sessionUser: session?.user })
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('UserContext: Processing SIGNED_IN event for user:', session.user.id)
        try {
          const { user: authUser, method, error } = await getCurrentUserWithClaims()
          console.log('UserContext: User data retrieved at login:', { user: authUser, method, error })
          
          if (authUser) {
            console.log('UserContext: Setting authenticated user:', authUser)
            setUser(authUser)
          } else {
            console.error('UserContext: No user data retrieved after SIGNED_IN event')
            setUser(null)
          }
        } catch (error) {
          console.error('UserContext: Error processing SIGNED_IN event:', error)
          setUser(null)
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('UserContext: Processing SIGNED_OUT event')
        setUser(null)
      } else if (event === 'INITIAL_SESSION') {
        // Skip - already handled in initializeAuth
      }
      
      setLoading(false)
    })

    return () => {
      console.log('UserContext: Cleaning up auth subscription')
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    loading,
    initialized,
    isAuthenticated: !!user
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export default UserContext