import { Navigate } from 'react-router-dom'
import { useAuth } from '../utils/useAuth'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  // Show loading during auth check
  if (loading) {
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

  // Redirect to onboarding if not completed
  if (!user.onboarding_completed) {
    return <Navigate to="/onboarding" replace />
  }

  // Render children if access is granted
  return children
}

export default ProtectedRoute