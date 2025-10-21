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
      try {
        const { user: authUser } = await getCurrentUserWithClaims()
        setUser(authUser)
      } catch (error) {
        console.error('UserContext: Error initializing auth:', error)
        setUser(null)
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('UserContext: Auth state change:', { event, hasSession: !!session })
      
      switch (event) {
        case 'INITIAL_SESSION':
          // Gérer la session initiale au chargement de l'app
          if (session?.user) {
            try {
              const { user: authUser } = await getCurrentUserWithClaims()
              setUser(authUser || null)
            } catch (error) {
              console.error('UserContext: Error processing INITIAL_SESSION event:', error)
              setUser(null)
            }
          } else {
            setUser(null)
          }
          break

        case 'SIGNED_IN':
          // Gérer la connexion utilisateur
          if (session?.user) {
            try {
              const { user: authUser } = await getCurrentUserWithClaims()
              setUser(authUser || null)
            } catch (error) {
              console.error('UserContext: Error processing SIGNED_IN event:', error)
              setUser(null)
            }
          }
          break

        case 'SIGNED_OUT':
          // Gérer la déconnexion utilisateur
          setUser(null)
          // Optionnel : nettoyer le localStorage/sessionStorage
          localStorage.removeItem('user-preferences')
          break

        case 'PASSWORD_RECOVERY':
          // Gérer la récupération de mot de passe
          console.log('UserContext: Password recovery initiated')
          // Vous pourriez rediriger vers la page de mise à jour du mot de passe
          // ou afficher une notification
          break

        case 'TOKEN_REFRESHED':
          // Gérer le rafraîchissement du token
          console.log('UserContext: Token refreshed successfully')
          // Optionnel : mettre à jour les données utilisateur si nécessaire
          if (session?.user) {
            try {
              const { user: authUser } = await getCurrentUserWithClaims()
              setUser(authUser || null)
            } catch (error) {
              console.error('UserContext: Error processing TOKEN_REFRESHED event:', error)
            }
          }
          break

        case 'USER_UPDATED':
          // Gérer la mise à jour des informations utilisateur
          console.log('UserContext: User information updated')
          if (session?.user) {
            try {
              const { user: authUser } = await getCurrentUserWithClaims()
              setUser(authUser || null)
            } catch (error) {
              console.error('UserContext: Error processing USER_UPDATED event:', error)
            }
          }
          break

        default:
          console.log('UserContext: Unhandled auth event:', event)
      }
      
      setLoading(false)
    })

    return () => {
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