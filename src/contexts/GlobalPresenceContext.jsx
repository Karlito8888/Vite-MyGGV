import { createContext, useState, useEffect, useContext, useRef } from 'react'
import { useUser } from './UserContext'
import { realtimeManager } from '../services/realtimeManager'


const GlobalPresenceContext = createContext()

/**
 * Global Presence Provider
 * Manages presence for ALL users in a single channel
 */
export function GlobalPresenceProvider({ children }) {
  const { user } = useUser()
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const presenceChannelRef = useRef(null)

  // Store user in ref to avoid recreating subscription
  const userRef = useRef(user)
  useEffect(() => {
    userRef.current = user
  }, [user])



  // Real-time presence subscription using centralized manager
  useEffect(() => {
    if (!userRef.current) return

    const channelName = 'global_presence'
    const userId = userRef.current.id
    
    // Utiliser le gestionnaire centralisé - il gérera automatiquement les doublons
    const setupPresenceChannel = (channel) => {
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState()
          const users = new Set()

          Object.values(state).forEach((presences) => {
            presences.forEach((presence) => {
              if (presence.user_id) {
                users.add(presence.user_id)
              }
            })
          })

          setOnlineUsers(users)
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          setOnlineUsers((prev) => {
            const updated = new Set(prev)
            newPresences.forEach((presence) => {
              if (presence.user_id) {
                updated.add(presence.user_id)
              }
            })
            return updated
          })
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
          setOnlineUsers((prev) => {
            const updated = new Set(prev)
            leftPresences.forEach((presence) => {
              if (presence.user_id) {
                updated.delete(presence.user_id)
              }
            })
            return updated
          })
        })
    }

    // S'abonner (le gestionnaire évitera les doublons automatiquement)
    realtimeManager.subscribe(channelName, setupPresenceChannel, [userId])
      .then(async (channel) => {
        presenceChannelRef.current = channel
        
        // Tracker l'utilisateur une fois le canal abonné
        if (userRef.current) {
          console.log('[REALTIME] 👤 Tracking user presence:', userRef.current.id)
          await channel.track({
            user_id: userRef.current.id,
            email: userRef.current.email,
            online_at: new Date().toISOString(),
          })
        }
      })
      .catch((error) => {
        console.error('[GLOBAL-PRESENCE] ❌ Failed to subscribe:', error)
      })

    // Pas de cleanup manuel - le gestionnaire centralisé s'en occupe
  }, [user?.id])

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId)
  }

  const value = {
    onlineUsers,
    isUserOnline,
  }

  return (
    <GlobalPresenceContext.Provider value={value}>
      {children}
    </GlobalPresenceContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useGlobalPresence = () => {
  const context = useContext(GlobalPresenceContext)
  if (!context) {
    throw new Error('useGlobalPresence must be used within a GlobalPresenceProvider')
  }
  return context
}
