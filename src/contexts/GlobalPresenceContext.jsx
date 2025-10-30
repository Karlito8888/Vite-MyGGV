import { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react'
import { supabase } from '../utils/supabase'
import { useUser } from './UserContext'
import { useRealtimeConnection } from '../hooks/useRealtimeConnection'

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

  const subscribeToPresence = useCallback(() => {
    if (!userRef.current) return null
    
    console.log('[REALTIME] 🔌 Setting up global presence subscription')
    
    const presenceChannel = supabase.channel('global_presence')

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
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
      .subscribe(async (status) => {
        console.log('[REALTIME] 📡 Global presence status:', status)
        if (status === 'SUBSCRIBED' && userRef.current) {
          console.log('[REALTIME] 👤 Tracking user presence:', userRef.current.id)
          await presenceChannel.track({
            user_id: userRef.current.id,
            email: userRef.current.email,
            online_at: new Date().toISOString(),
          })
        }
      })

    presenceChannelRef.current = presenceChannel

    return {
      unsubscribe: () => {
        console.log('[REALTIME] 🔌 Unsubscribing from global presence')
        if (presenceChannel) {
          presenceChannel.untrack()
          supabase.removeChannel(presenceChannel)
        }
      }
    }
  }, [])

  useRealtimeConnection(
    subscribeToPresence,
    [user?.id], // Only reconnect when user ID changes
    {
      reconnectOnVisibility: true,
      reconnectDelay: 2000,
      onReconnect: async () => {
        console.log('[REALTIME] ✅ Presence reconnected')
        // Re-track presence
        if (presenceChannelRef.current && userRef.current) {
          await presenceChannelRef.current.track({
            user_id: userRef.current.id,
            email: userRef.current.email,
            online_at: new Date().toISOString(),
          })
        }
      }
    }
  )

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
