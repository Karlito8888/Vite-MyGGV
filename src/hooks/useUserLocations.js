import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../utils/supabase'
import { useRealtimeConnection } from './useRealtimeConnection'

/**
 * Hook pour récupérer toutes les associations profile-location avec coordonnées
 * Optimisé avec une seule requête jointe
 */
export function useUserLocations() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUserLocations = useCallback(async () => {
      try {
        setLoading(true)
        
        // Requête optimisée : récupère toutes les associations avec les profils et locations en une seule requête
        const { data, error: fetchError } = await supabase
          .from('profile_location_associations')
          .select(`
            id,
            profile_id,
            location_id,
            is_verified,
            is_owner,
            profile:profiles(id, full_name, username, avatar_url),
            location:locations(id, block, lot, coordinates)
          `)
          .not('location.coordinates', 'is', null) // Filtrer les locations sans coordonnées

        if (fetchError) throw fetchError

        // Transformer les données pour faciliter l'utilisation
        const transformedData = data
          ?.filter(item => item.location?.coordinates) // Double vérification
          .map(item => ({
            id: item.id,
            profileId: item.profile_id,
            locationId: item.location_id,
            isVerified: item.is_verified,
            isOwner: item.is_owner,
            profile: item.profile,
            location: {
              id: item.location.id,
              block: item.location.block,
              lot: item.location.lot,
              // PostGIS retourne les coordonnées au format WKT: "POINT(longitude latitude)"
              coordinates: parsePostGISPoint(item.location.coordinates)
            }
          })) || []

        setLocations(transformedData)
        setError(null)
      } catch (err) {
        console.error('Error fetching user locations:', err)
        setError(err)
        setLocations([])
      } finally {
        setLoading(false)
      }
  }, [])

  // Store fetchUserLocations in ref for subscription
  const fetchUserLocationsRef = useRef(fetchUserLocations)
  useEffect(() => {
    fetchUserLocationsRef.current = fetchUserLocations
  }, [fetchUserLocations])

  // Initial load
  useEffect(() => {
    fetchUserLocations()
  }, [fetchUserLocations])

  // Real-time subscription
  const subscribeToLocationChanges = useCallback(() => {
    console.log('[REALTIME] 🔌 Subscribing to user_locations_changes channel')
    const channel = supabase
      .channel('user_locations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profile_location_associations'
        },
        () => {
          // Recharger les données quand il y a un changement
          fetchUserLocationsRef.current()
        }
      )
      .subscribe((status) => {
        console.log('[REALTIME] 📡 User locations changes channel status:', status)
      })

    return {
      unsubscribe: () => {
        console.log('[REALTIME] 🔌 Unsubscribing from user_locations_changes channel')
        supabase.removeChannel(channel)
      }
    }
  }, [])

  useRealtimeConnection(
    subscribeToLocationChanges,
    [],
    {
      reconnectOnVisibility: true,
      reconnectDelay: 1500,
      onReconnect: () => {
        console.log('[REALTIME] ✅ User locations reconnected')
        fetchUserLocationsRef.current()
      }
    }
  )

  return { locations, loading, error }
}

/**
 * Parse les coordonnées PostGIS au format WKT
 * @param {string|object} coordinates - Coordonnées au format "POINT(lng lat)" ou objet GeoJSON
 * @returns {{longitude: number, latitude: number}|null}
 */
function parsePostGISPoint(coordinates) {
  if (!coordinates) return null

  // Si c'est déjà un objet GeoJSON
  if (typeof coordinates === 'object' && coordinates.coordinates) {
    return {
      longitude: coordinates.coordinates[0],
      latitude: coordinates.coordinates[1]
    }
  }

  // Si c'est une chaîne WKT: "POINT(longitude latitude)"
  if (typeof coordinates === 'string') {
    const match = coordinates.match(/POINT\(([^ ]+) ([^ ]+)\)/)
    if (match) {
      return {
        longitude: parseFloat(match[1]),
        latitude: parseFloat(match[2])
      }
    }
  }

  return null
}
