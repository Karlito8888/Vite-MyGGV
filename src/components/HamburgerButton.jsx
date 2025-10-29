import { useLocation } from 'react-router'
import { useUser } from '../contexts'
import { Menu } from 'lucide-react'
import styles from './HamburgerButton.module.css'

function HamburgerButton({ onToggle, isOpen = false }) {
  const location = useLocation()
  const { user } = useUser()

  // List of protected routes
  const protectedRoutes = ['/home', '/dashboard', '/profile', '/messages', '/games', '/infos', '/money', '/weather', '/marketplace', '/location-requests']

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.includes(location.pathname)

  return (
    <button
      className={`${styles.hamburgerBtn} ${isOpen ? "open" : ""} ${!user || !isProtectedRoute ? styles.disabled : ""}`}
      onClick={user && isProtectedRoute ? onToggle : undefined}
      disabled={!user || !isProtectedRoute}
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={isOpen}
    >
      <Menu size={24} />
    </button>
  );
}

export default HamburgerButton