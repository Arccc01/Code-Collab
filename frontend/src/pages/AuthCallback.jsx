import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AuthCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    // If Google OAuth failed
    if (error) {
      navigate('/login?error=google_failed')
      return
    }

    // If no token in URL
    if (!token) {
      navigate('/login')
      return
    }

    // Decode token to get user info
    // JWT payload is base64 encoded — decode it without a library
    try {
      const base64Payload = token.split('.')[1]
      const decoded = JSON.parse(atob(base64Payload))

      const user = {
        _id: decoded._id,
        username: decoded.username,
        email: decoded.email,
        fullname: decoded.fullname,
        avatar: decoded.avatar,
      }

      // Save to context and localStorage
      login(token, user)
      navigate('/dashboard')

    } catch (err) {
      console.error('Failed to decode token:', err)
      navigate('/login')
    }
  }, [])

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">⬡ CodeCollab</div>
        <div className="auth-subtitle">Signing you in with Google...</div>
      </div>
    </div>
  )
}

export default AuthCallback