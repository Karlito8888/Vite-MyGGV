import PropTypes from 'prop-types'
import './RecenterButton.css'
import { LocateFixed } from 'lucide-react';

/**
 * RecenterButton - Bouton pour recentrer la carte sur la position par défaut
 * 
 * @param {Object} props
 * @param {Function} props.onRecenter - Fonction appelée lors du clic pour recentrer
 */
function RecenterButton({ onRecenter }) {
  return (
    <button
      className="map-control-btn recenter-button"
      onClick={onRecenter}
      aria-label="Recenter map"
      title="Recenter map"
    >
      <LocateFixed />
    </button>
  );
}

RecenterButton.propTypes = {
  onRecenter: PropTypes.func.isRequired,
}

export default RecenterButton
