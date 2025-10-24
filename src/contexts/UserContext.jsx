import { createContext, useState, useEffect, useContext } from 'react'
import { supabase } from '../utils/supabase'
import { getCurrentUserWithClaims } from '../utils/authHelpers'
import { getCurrentUserProfile } from '../services/profilesService'
import { getProfileAssociations } from '../services/profileLocationAssociationsService'

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
  const [profile, setProfile] = useState(null)
  const [locationAssociations, setLocationAssociations] = useState([])
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Fonction pour charger le profil utilisateur et ses associations de location
  const loadUserProfile = async (authUser) => {
    if (!authUser) {
      setProfile(null)
      setLocationAssociations([])
      return
    }

    setProfileLoading(true)
    try {
      // Charger le profil et les associations en parallèle pour optimiser
      const [profileResult, associationsResult] = await Promise.all([
        getCurrentUserProfile(),
        getProfileAssociations(authUser.id)
      ])

      if (profileResult.error) {
        console.error('UserContext: Error loading profile:', profileResult.error)
        setProfile(null)
      } else {
        setProfile(profileResult.data)
      }

      if (associationsResult.error) {
        console.error('UserContext: Error loading location associations:', associationsResult.error)
        setLocationAssociations([])
      } else {
        setLocationAssociations(associationsResult.data || [])
      }
    } catch (error) {
      console.error('UserContext: Exception loading profile:', error)
      setProfile(null)
      setLocationAssociations([])
    } finally {
      setProfileLoading(false)
    }
  }

  useEffect(() => {
    // Laisser onAuthStateChange gérer INITIAL_SESSION au lieu de doubler l'initialisation
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      switch (event) {
        case 'INITIAL_SESSION':
          // Gérer la session initiale au chargement de l'app
          if (session?.user) {
            try {
              const { user: authUser } = await getCurrentUserWithClaims()
              setUser(authUser || null)
              if (authUser) {
                await loadUserProfile(authUser)
              }
            } catch (error) {
              console.error('UserContext: Error processing INITIAL_SESSION event:', error)
              setUser(null)
            }
          } else {
            setUser(null)
          }
          setLoading(false)
          setInitialized(true)
          break

        case 'SIGNED_IN':
          // Gérer la connexion utilisateur
          if (session?.user) {
            try {
              const { user: authUser } = await getCurrentUserWithClaims()
              setUser(authUser || null)
              // Charger le profil après connexion
              if (authUser) {
                await loadUserProfile(authUser)
              }
            } catch (error) {
              console.error('UserContext: Error processing SIGNED_IN event:', error)
              setUser(null)
              setProfile(null)
            }
          }
          break

        case 'SIGNED_OUT':
          // Gérer la déconnexion utilisateur
          setUser(null)
          setProfile(null)
          setLocationAssociations([])
          // Optionnel : nettoyer le localStorage/sessionStorage
          localStorage.removeItem('user-preferences')
          break

        case 'PASSWORD_RECOVERY':
          // Gérer la récupération de mot de passe
          // Vous pourriez rediriger vers la page de mise à jour du mot de passe
          // ou afficher une notification
          break

        case 'TOKEN_REFRESHED':
          // Token refresh est silencieux, pas besoin de recharger
          break

        case 'USER_UPDATED':
          // Recharger seulement si vraiment nécessaire
          if (session?.user) {
            try {
              const { user: authUser } = await getCurrentUserWithClaims()
              setUser(authUser || null)
              if (authUser) {
                await loadUserProfile(authUser)
              }
            } catch (error) {
              console.error('UserContext: Error processing USER_UPDATED event:', error)
            }
          }
          break

        default:
          // Unhandled auth event
      }

      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    profile,
    locationAssociations,
    loading,
    profileLoading,
    initialized,
    isAuthenticated: !!user,
    refreshProfile: () => loadUserProfile(user),
    profileKey: profile?.updated_at || Date.now() // Force re-render when profile changes
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export default UserContext