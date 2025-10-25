import { blocks } from '../data/blocks'
import { getDeviceZoom } from '../utils/deviceDetection'

const DEFAULT_COORDS = {
  latitude: 14.347872973134175,
  longitude: 120.95134859887523,
}

export function useMapConfig(userLocation, mapType = 'osm') {
  // Pas de cache - recalculer à chaque fois
  const initialViewState = {
    center: [
      userLocation?.longitude || DEFAULT_COORDS.longitude,
      userLocation?.latitude || DEFAULT_COORDS.latitude,
    ],
    zoom: getDeviceZoom(),
    pitch: 0,
    bearing: 0,
    minZoom: 2,
  }

  const blocksGeoJSON = {
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
  }

  const mapStyle = {
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
  }

  return {
    initialViewState,
    blocksGeoJSON,
    mapStyle,
    DEFAULT_COORDS,
  }
}
