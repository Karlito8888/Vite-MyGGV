import PropTypes from 'prop-types'
import './Button.css'

/**
 * Button component - Composant de bouton réutilisable avec différentes variantes
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenu du bouton
 * @param {'primary' | 'secondary' | 'outline' | 'danger'} props.variant - Variante du bouton
 * @param {'small' | 'medium' | 'large'} props.size - Taille du bouton
 * @param {boolean} props.fullWidth - Bouton pleine largeur
 * @param {boolean} props.elevated - Effet d'élévation au survol
 * @param {boolean} props.loading - État de chargement
 * @param {boolean} props.disabled - Bouton désactivé
 * @param {'button' | 'submit' | 'reset'} props.type - Type du bouton
 * @param {Function} props.onClick - Fonction appelée au clic
 * @param {string} props.className - Classes CSS additionnelles
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  elevated = false,
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  const classNames = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full',
    elevated && 'btn-elevated',
    loading && 'btn-loading',
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="btn-spinner" />
          <span className="btn-loading-text">{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'danger']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  elevated: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
  className: PropTypes.string,
}
