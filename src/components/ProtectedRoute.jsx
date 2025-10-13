import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../utils/AuthContext'

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext)

  if (loading) {
    return (
      <div className="container text-center mt-6">
        <div>Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute