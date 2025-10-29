import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import '../styles/Home.css'
import '../components/Avatar.module.css'
import { useMapConfig, useUserLocations } from '../hooks'
import { useUser } from '../contexts/UserContext'
import { useGlobalPresence } from '../contexts/GlobalPresenceContext'
import MapTypeToggle from '../components/MapTypeToggle'
import RecenterButton from '../components/RecenterButton'
import UserProfileModal from '../components/UserProfileModal'
import houseIcon from '../assets/img/house.png'
import pinIcon from '../assets/img/pin.png'

function Home() {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [mapType, setMapType] = useState('osm')
  const [currentCenter, setCurrentCenter] = useState(null)
  const [currentZoom, setCurrentZoom] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState(null)

  const { user } = useUser()
  const { locations, loading: locationsLoading } = useUserLocations()
  const { initialViewState, blocksGeoJSON, mapStyle, DEFAULT_COORDS } = useMapConfig(null, mapType)
  const { isUserOnline } = useGlobalPresence()

  // Reconstruire la carte complètement à chaque changement de mapType
  useEffect(() => {
    if (!mapContainer.current) return

    // Détruire l'ancienne carte complètement
    if (map.current) {
      map.current.remove()
      map.current = null
    }

    // Créer une nouvelle carte
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: currentCenter || initialViewState.center,
      zoom: currentZoom || initialViewState.zoom,
      pitch: initialViewState.pitch,
      bearing: initialViewState.bearing,
      minZoom: initialViewState.minZoom || 2,
      attributionControl: false,
    })

    map.current.on('load', () => {
      // Ajouter la source des blocks
      map.current.addSource('blocks', {
        type: 'geojson',
        data: blocksGeoJSON,
      })

      // Ajouter les layers
      map.current.addLayer({
        id: 'blocks-fill',
        type: 'fill',
        source: 'blocks',
        layout: {
          visibility: mapType === 'satellite' ? 'none' : 'visible',
        },
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.8,
        },
      })

      map.current.addLayer({
        id: 'blocks-outline',
        type: 'line',
        source: 'blocks',
        layout: {
          visibility: mapType === 'satellite' ? 'none' : 'visible',
        },
        paint: {
          'line-color': '#00000026',
          'line-width': 2,
        },
      })

      map.current.addLayer({
        id: 'blocks-labels',
        type: 'symbol',
        source: 'blocks',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 14,
          'text-anchor': 'center',
        },
        paint: {
          'text-color': '#000000',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2,
        },
      })

      // Ajouter les markers
      if (locations.length > 0 && !locationsLoading) {
        // Grouper les locations par coordonnées
        const locationsByCoords = {}
        locations.forEach(({ profileId, location, profile }) => {
          if (!location?.coordinates) return
          const { longitude, latitude } = location.coordinates
          const key = `${longitude},${latitude}`

          if (!locationsByCoords[key]) {
            locationsByCoords[key] = {
              coordinates: { longitude, latitude },
              block: location.block,
              lot: location.lot,
              occupants: []
            }
          }

          locationsByCoords[key].occupants.push({
            profileId,
            profile,
            isCurrentUser: user?.id === profileId
          })
        })

        // Créer un marker pour chaque groupe de locations
        Object.values(locationsByCoords).forEach(({ coordinates, block, lot, occupants }) => {
          const { longitude, latitude } = coordinates
          const hasCurrentUser = occupants.some(o => o.isCurrentUser)

          const el = document.createElement('div')
          el.className = 'user-location-marker'
          el.style.backgroundImage = `url(${hasCurrentUser ? houseIcon : pinIcon})`
          el.style.width = hasCurrentUser ? '40px' : '32px'
          el.style.height = hasCurrentUser ? '40px' : '32px'
          el.style.backgroundSize = 'contain'
          el.style.backgroundRepeat = 'no-repeat'
          el.style.cursor = 'pointer'

          // Créer le HTML du popup avec avatars utilisant les classes Avatar
          const avatarsHTML = occupants.map(({ profileId, profile, isCurrentUser }) => {
            const avatarUrl = profile?.avatar_url
            const username = profile?.username || 'User'
            const fallbackText = username[0].toUpperCase()
            const isOnline = isUserOnline(profileId)

            // Générer l'avatar avec les classes du composant Avatar
            const avatarHTML = avatarUrl
              ? `<div class="avatar avatar--small ${isOnline ? 'avatar--online' : ''}">
                   <img src="${avatarUrl}" alt="${username}" class="avatar__image" />
                 </div>`
              : `<div class="avatar avatar--small avatar--fallback ${isOnline ? 'avatar--online' : ''}">
                   <div class="avatar__fallback">
                     <span class="avatar__fallback-text">${fallbackText}</span>
                   </div>
                 </div>`

            return `
              <div class="popup-avatar-item" data-user-id="${profileId}">
                ${avatarHTML}
                <div class="popup-avatar-info">
                  <div class="popup-avatar-name">${username}</div>
                  ${isCurrentUser ? '<div class="popup-current-user-badge">You</div>' : ''}
                </div>
              </div>
            `
          }).join('')

          const popupHTML = `
            <div class="location-popup">
              <div class="popup-header">
                <div class="popup-location-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  Block ${block}, Lot ${lot}
                </div>
              </div>
              <div class="popup-occupants">
                <div class="popup-occupants-title">${occupants.length > 1 ? 'Residents' : 'Resident'}</div>
                <div class="popup-avatars-list">
                  ${avatarsHTML}
                </div>
              </div>
            </div>
          `

          const popup = new maplibregl.Popup({
            anchor: 'bottom',
            offset: [0, -15],
            maxWidth: '320px',
            className: 'custom-popup',
            closeButton: true,
            closeOnClick: false
          }).setHTML(popupHTML)

          // Add click event listeners to avatar items after popup opens
          popup.on('open', () => {
            const avatarItems = document.querySelectorAll('.popup-avatar-item')
            avatarItems.forEach(item => {
              item.addEventListener('click', (e) => {
                const userId = e.currentTarget.getAttribute('data-user-id')
                if (userId) {
                  setSelectedUserId(userId)
                }
              })
            })
          })

          new maplibregl.Marker({ element: el })
            .setLngLat([longitude, latitude])
            .setPopup(popup)
            .addTo(map.current)
        })
      }
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [mapType, mapStyle, blocksGeoJSON, locations, locationsLoading, user, currentCenter, currentZoom, initialViewState, isUserOnline])



  const toggleMapType = () => {
    // Sauvegarder la position actuelle avant de changer
    if (map.current) {
      setCurrentCenter(map.current.getCenter())
      setCurrentZoom(map.current.getZoom())
    }
    setMapType((prev) => (prev === 'osm' ? 'satellite' : 'osm'))
  }

  const recenterMap = () => {
    if (map.current) {
      map.current.flyTo({
        center: [DEFAULT_COORDS.longitude, DEFAULT_COORDS.latitude],
        zoom: 15,
        duration: 1000
      })
    }
  }

  return (
    <div className="home-page">
      <div ref={mapContainer} className="map-container" />
      <MapTypeToggle mapType={mapType} onToggle={toggleMapType} />
      <RecenterButton onRecenter={recenterMap} />
      {selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  )
}

export default Home