import { useEffect, useCallback } from 'react'

/**
 * Hook pour écouter les événements Realtime Supabase
 * Utilise les événements custom émis par le GlobalRealtimeManager
 */
export function useSupabaseRealtime(eventType, callback, dependencies = []) {
  const handleEvent = useCallback((event) => {
    callback(event.detail)
  }, [callback])

  useEffect(() => {
    const eventName = `supabase:${eventType}`
    
    window.addEventListener(eventName, handleEvent)
    
    return () => {
      window.removeEventListener(eventName, handleEvent)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventType, handleEvent, ...dependencies])
}

/**
 * Hook spécifique pour les messages publics
 */
export function usePublicMessages(callback, dependencies = []) {
  return useSupabaseRealtime('public-message', callback, dependencies)
}

/**
 * Hook spécifique pour les messages privés
 */
export function usePrivateMessages(callback, dependencies = []) {
  return useSupabaseRealtime('private-message', callback, dependencies)
}

/**
 * Hook spécifique pour les notifications de conversation
 */
export function useConversationNotifications(callback, dependencies = []) {
  return useSupabaseRealtime('conversation-notification', callback, dependencies)
}

/**
 * Hook spécifique pour le chat public
 */
export function usePublicChat(callback, dependencies = []) {
  return useSupabaseRealtime('public-chat', callback, dependencies)
}