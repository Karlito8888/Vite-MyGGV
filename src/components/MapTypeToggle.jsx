import PropTypes from 'prop-types'
import './MapTypeToggle.css'
import { Map, Satellite } from 'lucide-react';

/**
 * MapTypeToggle - Bouton pour basculer entre les types de carte (OSM/Satellite)
 * 
 * @param {Object} props
 * @param {'osm' | 'satellite'} props.mapType - Type de carte actuel
 * @param {Function} props.onToggle - Fonction appelée lors du changement de type
 */
function MapTypeToggle({ mapType = 'osm', onToggle }) {
  return (
    <button
      className="map-control-btn map-type-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${mapType === "osm" ? "satellite" : "map"} view`}
      title={`Switch to ${mapType === "osm" ? "satellite" : "map"} view`}
    >
      {mapType === "osm" ? (
        // Satellite icon
        <Satellite />
      ) : (
        // Map icon
        <Map />
      )}
    </button>
  );
}

MapTypeToggle.propTypes = {
  mapType: PropTypes.oneOf(['osm', 'satellite']).isRequired,
  onToggle: PropTypes.func.isRequired,
}

export default MapTypeToggle
