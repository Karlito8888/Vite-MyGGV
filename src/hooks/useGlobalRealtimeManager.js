import { useEffect, useCallback } from 'react'
import { useRealtimeConnection } from './useRealtimeConnection'
import { supabase } from '../utils/supabase'

/**
 * Hook global pour gérer toutes les connexions Realtime Supabase
 * Gère la reconnexion automatique lors du changement d'onglets
 */
export function useGlobalRealtimeManager() {
  // Connexion pour les messages publics
  const publicMessagesConnection = useRealtimeConnection(
    useCallback(() => {
      console.log('[GLOBAL-REALTIME] 🔌 Subscribing to public messages')
      return supabase
        .channel('public-messages')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'messages',
            filter: 'type=eq.public'
          }, 
          (payload) => {
            console.log('[GLOBAL-REALTIME] 📨 Public message change:', payload)
            // Émettre un événement custom pour les composants
            window.dispatchEvent(new CustomEvent('supabase:public-message', { 
              detail: payload 
            }))
          }
        )
        .subscribe()
    }, []),
    [],
    {
      reconnectOnVisibility: true,
      reconnectDelay: 1000,
      onReconnect: () => {
        console.log('[GLOBAL-REALTIME] ✅ Public messages reconnected')
      },
      onDisconnect: () => {
        console.log('[GLOBAL-REALTIME] ❌ Public messages disconnected')
      }
    }
  )

  // Connexion pour les conversations privées
  const privateMessagesConnection = useRealtimeConnection(
    useCallback(() => {
      console.log('[GLOBAL-REALTIME] 🔌 Subscribing to private messages')
      return supabase
        .channel('private-messages')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'private_messages'
          }, 
          (payload) => {
            console.log('[GLOBAL-REALTIME] 📨 Private message change:', payload)
            // Émettre un événement custom pour les composants
            window.dispatchEvent(new CustomEvent('supabase:private-message', { 
              detail: payload 
            }))
          }
        )
        .subscribe()
    }, []),
    [],
    {
      reconnectOnVisibility: true,
      reconnectDelay: 1200, // Léger décalage pour éviter les reconnexions simultanées
      onReconnect: () => {
        console.log('[GLOBAL-REALTIME] ✅ Private messages reconnected')
      },
      onDisconnect: () => {
        console.log('[GLOBAL-REALTIME] ❌ Private messages disconnected')
      }
    }
  )

  // Connexion pour les notifications de conversation
  const conversationNotificationsConnection = useRealtimeConnection(
    useCallback(() => {
      console.log('[GLOBAL-REALTIME] 🔌 Subscribing to conversation notifications')
      return supabase
        .channel('conversation-notifications')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'conversation_notifications'
          }, 
          (payload) => {
            console.log('[GLOBAL-REALTIME] 📨 Conversation notification:', payload)
            // Émettre un événement custom pour les composants
            window.dispatchEvent(new CustomEvent('supabase:conversation-notification', { 
              detail: payload 
            }))
          }
        )
        .subscribe()
    }, []),
    [],
    {
      reconnectOnVisibility: true,
      reconnectDelay: 1400, // Autre décalage
      onReconnect: () => {
        console.log('[GLOBAL-REALTIME] ✅ Conversation notifications reconnected')
      },
      onDisconnect: () => {
        console.log('[GLOBAL-REALTIME] ❌ Conversation notifications disconnected')
      }
    }
  )

  // Connexion pour le chat public
  const publicChatConnection = useRealtimeConnection(
    useCallback(() => {
      console.log('[GLOBAL-REALTIME] 🔌 Subscribing to public chat')
      return supabase
        .channel('public-chat')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'chat',
            filter: 'channel_id=eq.general'
          }, 
          (payload) => {
            console.log('[GLOBAL-REALTIME] 📨 Public chat message:', payload)
            // Émettre un événement custom pour les composants
            window.dispatchEvent(new CustomEvent('supabase:public-chat', { 
              detail: payload 
            }))
          }
        )
        .subscribe()
    }, []),
    [],
    {
      reconnectOnVisibility: true,
      reconnectDelay: 1600, // Autre décalage
      onReconnect: () => {
        console.log('[GLOBAL-REALTIME] ✅ Public chat reconnected')
      },
      onDisconnect: () => {
        console.log('[GLOBAL-REALTIME] ❌ Public chat disconnected')
      }
    }
  )

  // Fonction pour forcer la reconnexion manuelle
  const forceReconnectAll = useCallback(() => {
    console.log('[GLOBAL-REALTIME] 🔄 Forcing reconnection of all channels')
    publicMessagesConnection.reconnect()
    privateMessagesConnection.reconnect()
    conversationNotificationsConnection.reconnect()
    publicChatConnection.reconnect()
  }, [publicMessagesConnection, privateMessagesConnection, conversationNotificationsConnection, publicChatConnection])

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      console.log('[GLOBAL-REALTIME] 🧹 Cleaning up all realtime connections')
    }
  }, [])

  return {
    isConnected: {
      publicMessages: publicMessagesConnection.isConnected,
      privateMessages: privateMessagesConnection.isConnected,
      conversationNotifications: conversationNotificationsConnection.isConnected,
      publicChat: publicChatConnection.isConnected
    },
    forceReconnectAll,
    reconnect: {
      publicMessages: publicMessagesConnection.reconnect,
      privateMessages: privateMessagesConnection.reconnect,
      conversationNotifications: conversationNotificationsConnection.reconnect,
      publicChat: publicChatConnection.reconnect
    },
    disconnect: {
      publicMessages: publicMessagesConnection.disconnect,
      privateMessages: privateMessagesConnection.disconnect,
      conversationNotifications: conversationNotificationsConnection.disconnect,
      publicChat: publicChatConnection.disconnect
    }
  }
}