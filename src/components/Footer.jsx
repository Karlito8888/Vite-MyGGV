import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../utils/AuthContext'
import '../styles/Footer.css'

function Footer() {
  const { user } = useContext(AuthContext)

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <nav className="footer-nav">
            {user && (
              <>
                <Link to="/home" className="nav-link">Home</Link>
                <Link to="/profile" className="nav-link">Profile</Link>
              </>
            )}
          </nav>
          <p>&copy; {new Date().getFullYear()} Garden Grove Village</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer