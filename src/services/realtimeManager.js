/**
 * Centralized Supabase Realtime Subscription Manager
 * 
 * This manager prevents duplicate subscriptions and provides standardized
 * channel naming, retry logic, and cleanup functionality.
 * 
 * Features:
 * - Automatic duplicate prevention
 * - Exponential backoff retry logic
 * - Standardized channel naming conventions
 * - Memory leak prevention through proper cleanup
 * - Debug utilities for troubleshooting
 * 
 * Usage Examples:
 * ```javascript
 * // Using standardized channel naming
 * const subscription = await realtimeManager.subscribeStandard(
 *   'chat', 
 *   (channel) => channel.on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, callback),
 *   [channelId],
 *   channelId
 * )
 * 
 * // Using custom channel naming
 * const subscription = await realtimeManager.subscribe(
 *   'my-custom-channel',
 *   (channel) => channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, callback),
 *   [userId]
 * )
 * 
 * // Cleanup when component unmounts
 * useEffect(() => {
 *   return () => {
 *     if (subscription) {
 *       subscription.unsubscribe()
 *     }
 *   }
 * }, [])
 * ```
 */

import { supabase } from '../utils/supabase'

class RealtimeManager {
  constructor() {
    this.channels = new Map() // channelName -> channel instance
    this.setupCallbacks = new Map() // channelName -> setup callback
    this.isSubscribing = new Set() // Pour éviter les souscriptions simultanées
    this.retryAttempts = new Map() // channelName -> retry count
    this.maxRetries = 3
  }

  /**
   * Standardized channel naming conventions
   * 
   * These helpers ensure consistent channel naming across the application.
   * Use these patterns when creating new RealTime subscriptions.
   * 
   * Format: "entity:identifier" or "entity_changes" for table-wide subscriptions
   * 
   * Available patterns:
   * - chat: (channelId) -> "chat:123" - For specific chat channels
   * - privateMessages: (userId) -> "private_messages:456" - For user-specific private messages
   * - headerMessages: () -> "header-messages" - For public header messages
   * - locationRequests: () -> "location_requests_changes" - For location request table changes
   * - globalPresence: () -> "global_presence" - For global presence tracking
   * - userLocations: () -> "user_locations_changes" - For user location table changes
   * - approvalStatus: () -> "approval_status" - For approval status changes
   */
  static channelNames = {
    chat: (channelId) => `chat:${channelId}`,
    privateMessages: (userId) => `private_messages:${userId}`,
    headerMessages: () => 'header-messages',
    locationRequests: () => 'location_requests_changes',
    globalPresence: () => 'global_presence',
    userLocations: () => 'user_locations_changes',
    approvalStatus: () => 'approval_status'
  }

  /**
   * S'abonner à un canal Realtime avec prévention stricte des doublons
   * @param {string} channelName - Nom du canal
   * @param {Function} setupCallback - Fonction pour configurer le canal
   * @param {Array} dependencies - Dépendances pour recréer le canal si nécessaire
   */
  async subscribe(channelName, setupCallback, dependencies = []) {
    // Clé unique basée sur le nom et les dépendances
    const key = `${channelName}:${JSON.stringify(dependencies)}`
    
    // Si le canal existe déjà, retourner l'instance existante
    if (this.channels.has(key)) {
      console.log(`[REALTIME-MANAGER] ✅ Channel ${channelName} already exists, reusing`)
      return this.channels.get(key)
    }

    // Si une souscription est en cours pour ce canal, attendre
    if (this.isSubscribing.has(key)) {
      console.log(`[REALTIME-MANAGER] ⏳ Subscription in progress for ${channelName}, waiting...`)
      // Attendre un peu et réessayer
      await new Promise(resolve => setTimeout(resolve, 100))
      return this.subscribe(channelName, setupCallback, dependencies)
    }

    this.isSubscribing.add(key)
    console.log(`[REALTIME-MANAGER] 🔌 Creating new channel: ${channelName}`)
    
    try {
      return await this._subscribeWithRetry(channelName, setupCallback, key)
    } finally {
      this.isSubscribing.delete(key)
    }
  }

  /**
   * Subscribe with retry logic
   * @private
   */
  async _subscribeWithRetry(channelName, setupCallback, key) {
    const retryCount = this.retryAttempts.get(key) || 0
    
    try {
      // Créer le canal
      const channel = supabase.channel(channelName)
      
      // Configurer le canal avec le callback fourni
      setupCallback(channel)
      
      // S'abonner et attendre le statut
      await new Promise((resolve, reject) => {
        channel.subscribe((status) => {
          console.log(`[REALTIME-MANAGER] 📡 ${channelName} status:`, status)
          if (status === 'SUBSCRIBED') {
            this.retryAttempts.delete(key) // Reset retry count on success
            resolve()
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            reject(new Error(`Channel ${channelName} failed to subscribe: ${status}`))
          }
        })
      })

      // Stocker le canal et le callback
      this.channels.set(key, channel)
      this.setupCallbacks.set(key, setupCallback)
      
      return channel
    } catch (error) {
      console.error(`[REALTIME-MANAGER] ❌ Subscription failed for ${channelName}:`, error.message)
      
      if (retryCount < this.maxRetries) {
        this.retryAttempts.set(key, retryCount + 1)
        const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff
        console.log(`[REALTIME-MANAGER] 🔄 Retrying ${channelName} in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`)
        
        await new Promise(resolve => setTimeout(resolve, delay))
        return this._subscribeWithRetry(channelName, setupCallback, key)
      } else {
        this.retryAttempts.delete(key)
        throw error
      }
    }
  }

  /**
   * Se désabonner d'un canal (si nécessaire)
   * @param {string} channelName - Nom du canal
   * @param {Array} dependencies - Dépendances utilisées lors de la création
   */
  unsubscribe(channelName, dependencies = []) {
    const key = `${channelName}:${JSON.stringify(dependencies)}`
    
    if (this.channels.has(key)) {
      console.log(`[REALTIME-MANAGER] 🔌 Unsubscribing from: ${channelName}`)
      const channel = this.channels.get(key)
      supabase.removeChannel(channel)
      this.channels.delete(key)
      this.setupCallbacks.delete(key)
    }
  }

  /**
   * Vérifier si un canal existe
   * @param {string} channelName - Nom du canal
   * @param {Array} dependencies - Dépendances utilisées lors de la création
   */
  hasChannel(channelName, dependencies = []) {
    const key = `${channelName}:${JSON.stringify(dependencies)}`
    return this.channels.has(key)
  }

  /**
   * Obtenir un canal existant sans le créer
   * @param {string} channelName - Nom du canal
   * @param {Array} dependencies - Dépendances utilisées lors de la création
   */
  getChannel(channelName, dependencies = []) {
    const key = `${channelName}:${JSON.stringify(dependencies)}`
    return this.channels.get(key) || null
  }

  /**
   * Nettoyer tous les canaux (appelé au logout)
   */
  cleanup() {
    console.log('[REALTIME-MANAGER] 🧹 Cleaning up all channels')
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel)
    })
    this.channels.clear()
    this.setupCallbacks.clear()
    this.isSubscribing.clear()
    this.retryAttempts.clear()
  }

  /**
   * Obtenir des informations de debug sur les canaux actifs
   */
  getDebugInfo() {
    return {
      activeChannels: Array.from(this.channels.keys()),
      subscribingChannels: Array.from(this.isSubscribing),
      retryAttempts: Object.fromEntries(this.retryAttempts),
      totalChannels: this.channels.size,
      maxRetries: this.maxRetries
    }
  }

  /**
   * Get channel by type using standardized naming
   * @param {string} type - Channel type from channelNames
   * @param {...any} args - Arguments for channel name generation
   */
  getStandardChannelName(type, ...args) {
    if (typeof this.constructor.channelNames[type] === 'function') {
      return this.constructor.channelNames[type](...args)
    }
    throw new Error(`Unknown channel type: ${type}`)
  }

  /**
   * Subscribe using standardized channel naming
   * @param {string} type - Channel type from channelNames
   * @param {Function} setupCallback - Setup callback
   * @param {Array} dependencies - Dependencies array
   * @param {...any} args - Arguments for channel name generation
   */
  async subscribeStandard(type, setupCallback, dependencies = [], ...args) {
    const channelName = this.getStandardChannelName(type, ...args)
    return this.subscribe(channelName, setupCallback, dependencies)
  }
}

// Instance singleton
export const realtimeManager = new RealtimeManager()

// Export pour utilisation dans les composants
export default realtimeManager