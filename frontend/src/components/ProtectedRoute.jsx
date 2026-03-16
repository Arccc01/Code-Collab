import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  // Wait until auth check is complete
  if (loading) {
    return <div>Loading...</div>
  }

  // If not logged in redirect to login
  if (!user || !token) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute