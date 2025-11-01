import { usePWATabRecovery } from '../hooks/usePWATabRecovery'
import styles from './PWARecoveryIndicator.module.css'

/**
 * Composant pour afficher l'état de récupération de la PWA
 * Affiche un indicateur visuel lorsque la PWA est en train de récupérer
 * après un changement d'onglet
 */
export function PWARecoveryIndicator() {
  const { isRecovering, getRecoveryStats } = usePWATabRecovery()

  // Ne rien afficher si pas en cours de récupération
  if (!isRecovering) {
    return null
  }

  const stats = getRecoveryStats()

  return (
    <div className={styles.indicator}>
      <div className={styles.content}>
        <div className={styles.spinner}></div>
        <div className={styles.message}>
          <p className={styles.title}>Reconnexion en cours...</p>
          <p className={styles.subtitle}>
            Restauration des connexions ({stats.healthyConnections}/{stats.totalConnections})
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Composant pour afficher un bouton de récupération manuelle
 * Utile pour le débogage ou si l'utilisateur rencontre des problèmes
 */
export function PWARecoveryButton({ className = '' }) {
  const { forceRecovery, isRecovering, getRecoveryStats } = usePWATabRecovery()

  const handleClick = () => {
    if (!isRecovering) {
      forceRecovery()
    }
  }

  // Afficher uniquement en mode développement
  if (!import.meta.env.DEV) {
    return null
  }

  const stats = getRecoveryStats()

  return (
    <button
      onClick={handleClick}
      disabled={isRecovering}
      className={`${styles.button} ${className}`}
      title={`Connections: ${stats.healthyConnections}/${stats.totalConnections}`}
    >
      {isRecovering ? '🔄 Récupération...' : '🔧 Forcer la récupération'}
    </button>
  )
}

export default PWARecoveryIndicator
