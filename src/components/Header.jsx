import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../utils/AuthContext'
import '../styles/Header.css'

function Header() {
  const { user } = useContext(AuthContext)

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <h1 className="header-title">PWA App</h1>
          <nav className="header-nav">
            {user && (
              <>
                <Link to="/home" className="nav-link">Home</Link>
                <Link to="/profile" className="nav-link">Profile</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header