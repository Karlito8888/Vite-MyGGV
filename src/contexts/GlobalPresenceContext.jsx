import { createContext, useState, useEffect, useContext } from 'react'
import { supabase } from '../utils/supabase'
import { useUser } from './UserContext'

const GlobalPresenceContext = createContext()

/**
 * Global Presence Provider
 * Manages presence for ALL users in a single channel
 */
export function GlobalPresenceProvider({ children }) {
  const { user } = useUser()
  const [onlineUsers, setOnlineUsers] = useState(new Set())

  useEffect(() => {
    // Create a single global presence channel
    console.log('[REALTIME] 🔌 Subscribing to global_presence channel')
    const presenceChannel = supabase.channel('global_presence')

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const users = new Set()

        // Collect all online user IDs
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
      .subscribe(async (status) => {
        console.log('[REALTIME] 📡 Global presence channel status:', status)
        if (status === 'SUBSCRIBED' && user) {
          // Track current user's presence
          console.log('[REALTIME] 👤 Tracking user presence:', user.id)
          await presenceChannel.track({
            user_id: user.id,
            email: user.email,
            online_at: new Date().toISOString(),
          })
        }
      })

    // Cleanup
    return () => {
      if (presenceChannel) {
        console.log('[REALTIME] 🔌 Unsubscribing from global_presence channel')
        presenceChannel.untrack()
        supabase.removeChannel(presenceChannel)
      }
    }
  }, [user])

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
