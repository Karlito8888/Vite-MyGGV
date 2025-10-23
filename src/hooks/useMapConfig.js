import { useMemo } from 'react'
import { blocks } from '../data/blocks'

const DEFAULT_COORDS = {
  latitude: 14.347872973134175,
  longitude: 120.95134859887523,
}

export function useMapConfig(userLocation, mapType = 'osm') {
  const initialViewState = useMemo(
    () => ({
      center: [
        userLocation?.longitude || DEFAULT_COORDS.longitude,
        userLocation?.latitude || DEFAULT_COORDS.latitude,
      ],
      zoom: 15,
      pitch: 0,
      bearing: 0,
    }),
    [userLocation]
  )

  const blocksGeoJSON = useMemo(
    () => ({
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
    }),
    []
  )

  const mapStyle = useMemo(
    () => ({
      version: 8,
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors',
        },
        satellite: {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          attribution: '© Esri',
          maxzoom: 18,
        },
      },
      layers: [
        {
          id: 'base-layer',
          type: 'raster',
          source: mapType,
        },
      ],
    }),
    [mapType]
  )

  return {
    initialViewState,
    blocksGeoJSON,
    mapStyle,
    DEFAULT_COORDS,
  }
}
