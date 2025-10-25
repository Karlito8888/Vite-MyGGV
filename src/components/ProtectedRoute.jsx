import { Navigate, Outlet } from 'react-router'
import { ClimbingBoxLoader } from 'react-spinners'
import { useUser } from '../contexts'

function ProtectedRoute() {
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

  // Render nested routes
  return <Outlet />
}

export default ProtectedRoute