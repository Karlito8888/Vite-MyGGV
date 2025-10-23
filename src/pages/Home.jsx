import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import '../styles/Home.css'
import { useMapConfig } from '../hooks'

function Home() {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [mapType, setMapType] = useState('osm')

  const { initialViewState, blocksGeoJSON, mapStyle, DEFAULT_COORDS } = useMapConfig(null, mapType)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: initialViewState.center,
      zoom: initialViewState.zoom,
      pitch: initialViewState.pitch,
      bearing: initialViewState.bearing,
      attributionControl: false,
    })

    map.current.addControl(new maplibregl.NavigationControl(), 'bottom-right')

    map.current.on('load', () => {
      map.current.addSource('blocks', {
        type: 'geojson',
        data: blocksGeoJSON,
      })

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
          'line-color': '#00000037',
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
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [mapStyle, initialViewState, blocksGeoJSON, mapType])



  const toggleMapType = () => {
    setMapType((prev) => (prev === 'osm' ? 'satellite' : 'osm'))
  }

  const recenterMap = () => {
    console.log('🎯 Recenter button clicked')
    console.log('Map instance:', map.current ? '✅ exists' : '❌ null')
    console.log('DEFAULT_COORDS:', DEFAULT_COORDS)
    
    if (map.current) {
      console.log('🚀 Flying to:', [DEFAULT_COORDS.longitude, DEFAULT_COORDS.latitude])
      map.current.flyTo({
        center: [DEFAULT_COORDS.longitude, DEFAULT_COORDS.latitude],
        zoom: 15,
        duration: 1000
      })
    } else {
      console.log('❌ Map not initialized')
    }
  }

  return (
    <div className="home-page">
      <div ref={mapContainer} className="map-container" />
      <button className="map-type-toggle" onClick={toggleMapType}>
        {mapType === 'osm' ? '🛰️' : '🗺️'}
      </button>
      <button className="recenter-button" onClick={recenterMap}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
          <path fillRule="evenodd" d="M12 5.25c1.213 0 2.415.046 3.605.135a3.256 3.256 0 0 1 3.01 3.01c.044.583.077 1.17.1 1.759L17.03 8.47a.75.75 0 1 0-1.06 1.06l3 3a.75.75 0 0 0 1.06 0l3-3a.75.75 0 0 0-1.06-1.06l-1.752 1.751c-.023-.65-.06-1.296-.108-1.939a4.756 4.756 0 0 0-4.392-4.392 49.422 49.422 0 0 0-7.436 0A4.756 4.756 0 0 0 3.89 8.282c-.017.224-.033.447-.046.672a.75.75 0 1 0 1.497.092c.013-.217.028-.434.044-.651a3.256 3.256 0 0 1 3.01-3.01c1.19-.09 2.392-.135 3.605-.135Zm-6.97 6.22a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.752-1.751c.023.65.06 1.296.108 1.939a4.756 4.756 0 0 0 4.392 4.392 49.413 49.413 0 0 0 7.436 0 4.756 4.756 0 0 0 4.392-4.392c.017-.223.032-.447.046-.672a.75.75 0 0 0-1.497-.092c-.013.217-.028.434-.044.651a3.256 3.256 0 0 1-3.01 3.01 47.953 47.953 0 0 1-7.21 0 3.256 3.256 0 0 1-3.01-3.01 47.759 47.759 0 0 1-.1-1.759L6.97 15.53a.75.75 0 0 0 1.06-1.06l-3-3Z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )
}

export default Home