import { Navigate } from 'react-router'
import { ClimbingBoxLoader } from 'react-spinners'
import { useUser } from '../contexts'

function ProtectedRoute({ children }) {
  const { user, initialized } = useUser()

  // Show loading during initial auth check
  if (!initialized) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%'
      }}>
        <ClimbingBoxLoader color="var(--color-primary)" size={20} loading={true} />
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