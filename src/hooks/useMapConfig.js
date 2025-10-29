import { useMemo } from 'react'
import { blocks } from '../data/blocks'
import { getDeviceZoom } from '../utils/deviceDetection'

const DEFAULT_COORDS = {
  latitude: 14.347872973134175,
  longitude: 120.95134859887523,
}

export function useMapConfig(userLocation, mapType = 'osm') {
  // Mémoriser initialViewState
  const initialViewState = useMemo(() => ({
    center: [
      userLocation?.longitude || DEFAULT_COORDS.longitude,
      userLocation?.latitude || DEFAULT_COORDS.latitude,
    ],
    zoom: getDeviceZoom(),
    pitch: 0,
    bearing: 0,
    minZoom: 2,
  }), [userLocation?.longitude, userLocation?.latitude])

  // Mémoriser blocksGeoJSON (ne change jamais)
  const blocksGeoJSON = useMemo(() => ({
    type: 'FeatureCollection',
    features: blocks
      .filter((block) => block.coords.length > 0)
      .map((block) => ({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [block.coords],
        },
        properties: {
          name: block.name || '',
          color: block.color || '#E0DFDF',
        },
      })),
  }), []) // Pas de dépendances - blocks est statique

  // Mémoriser mapStyle (change seulement avec mapType)
  const mapStyle = useMemo(() => ({
    version: 8,
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
      osm: {
        type: 'raster',
        tiles: [
          "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
          "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
          "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
        ],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors, © CARTO',
      },
      satellite: {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
        attribution: '© Esri',
      },
    },
    layers: [
      {
        id: 'base-layer',
        type: 'raster',
        source: mapType,
      },
    ],
  }), [mapType])

  return {
    initialViewState,
    blocksGeoJSON,
    mapStyle,
    DEFAULT_COORDS,
  }
}
