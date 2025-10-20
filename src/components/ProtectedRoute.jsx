import { Navigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'

function ProtectedRoute({ children }) {
  const { user, initialized } = useUser()

  // Show loading during initial auth check
  if (!initialized) {
    return (
      <div className="container text-center mt-6">
        <div>Loading...</div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Render children if access is granted
  return children
}

export default ProtectedRoute