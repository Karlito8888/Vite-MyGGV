import { supabase } from '../utils/supabase'
import { usePreloadData, usePreloadIcons } from '../hooks/usePreloadData'
import { useUser } from '../contexts/UserContext'
import '../styles/Home.css'

function Home() {
  const { user } = useUser()
  
  // Preload critical data and icons for better UX
  usePreloadData()
  usePreloadIcons()



  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="home-page">
      <div className="container">
        <div className="home-content">
          <h2>Welcome Home!</h2>
          <p className="home-subtitle">
            Hello {user?.email}! You're successfully logged in to your PWA app.
          </p>
          
          <div className="home-features">
            <div className="feature-card">
              <h3>🚀 Fast & Reliable</h3>
              <p>Built with Vite for lightning-fast development and optimized builds.</p>
            </div>
            
            <div className="feature-card">
              <h3>📱 Mobile First</h3>
              <p>Designed specifically for mobile devices with responsive layouts.</p>
            </div>
            
            <div className="feature-card">
              <h3>🔒 Secure</h3>
              <p>Protected routes and secure authentication system.</p>
            </div>
          </div>
          
          <div className="home-actions">
            <button className="btn btn-primary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home