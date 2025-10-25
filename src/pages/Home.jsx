import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import '../styles/Home.css'
import { useMapConfig, useUserLocations } from '../hooks'
import { useUser } from '../contexts/UserContext'
import MapTypeToggle from '../components/MapTypeToggle'
import RecenterButton from '../components/RecenterButton'
import houseIcon from '../assets/img/house.png'
import pinIcon from '../assets/img/pin.png'

function Home() {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [mapType, setMapType] = useState('osm')
  const [currentCenter, setCurrentCenter] = useState(null)
  const [currentZoom, setCurrentZoom] = useState(null)

  const { user } = useUser()
  const { locations, loading: locationsLoading } = useUserLocations()
  const { initialViewState, blocksGeoJSON, mapStyle, DEFAULT_COORDS } = useMapConfig(null, mapType)

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
        locations.forEach(({ profileId, location, profile }) => {
          if (!location?.coordinates) return

          const { longitude, latitude } = location.coordinates
          const isCurrentUser = user?.id === profileId

          const el = document.createElement('div')
          el.className = 'user-location-marker'
          el.style.backgroundImage = `url(${isCurrentUser ? houseIcon : pinIcon})`
          el.style.width = isCurrentUser ? '40px' : '32px'
          el.style.height = isCurrentUser ? '40px' : '32px'
          el.style.backgroundSize = 'contain'
          el.style.backgroundRepeat = 'no-repeat'
          el.style.cursor = 'pointer'

          new maplibregl.Marker({ element: el })
            .setLngLat([longitude, latitude])
            .setPopup(
              new maplibregl.Popup({ offset: 25 })
                .setHTML(`
                  <div style="padding: 8px;">
                    <strong>${profile?.full_name || profile?.username || 'Utilisateur'}</strong>
                    ${isCurrentUser ? '<br/><em style="color: #4CAF50;">Your Location</em>' : ''}
                    <br/>
                    <small>Block ${location.block}, Lot ${location.lot}</small>
                  </div>
                `)
            )
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
  }, [mapType, mapStyle, blocksGeoJSON, locations, locationsLoading, user, currentCenter, currentZoom, initialViewState])



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
    </div>
  )
}

export default Home