import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axiosInstance from '../api/axios'
import './Dashboard.css'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [joinSessionId, setJoinSessionId] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axiosInstance.get('/sessions/my-sessions')
        setSessions(response.data.sessions)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load sessions')
      } finally {
        setLoading(false)
      }
    }
    fetchSessions()
  }, [])

  const handleCreateSession = async () => {
    try {
      setCreating(true)
      const response = await axiosInstance.post('/sessions/create')
      const { session } = response.data
      navigate(`/session/${session.sessionId}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create session')
    } finally {
      setCreating(false)
    }
  }

  const handleJoinSession = () => {
    if (!joinSessionId.trim()) return
    navigate(`/session/${joinSessionId.trim()}`)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // get first letter of name for avatar
  const avatarLetter = user?.fullname?.firstname?.charAt(0).toUpperCase()

  return (
    <div className="dashboard-page">

      {/* Navbar */}
      <div className="dashboard-navbar">
        <div className="dashboard-logo">⬡ CodeCollab</div>
        <div className="dashboard-user">
          <span className="dashboard-username">
            @{user?.username}
          </span>
          <div className="dashboard-avatar">{avatarLetter}</div>
          <button className="dashboard-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="dashboard-content">

        {/* Welcome */}
        <div className="dashboard-welcome">
          <h2>
            Welcome back, {user?.fullname?.firstname} {user?.fullname?.lastname}
          </h2>
          <p>Start a new session or join an existing one</p>
        </div>

        {/* Actions */}
        <div className="dashboard-actions">

          {/* Create Session */}
          <div className="dashboard-card">
            <h3>New Session</h3>
            <button
              className="dashboard-create-btn"
              onClick={handleCreateSession}
              disabled={creating}
            >
              {creating ? 'Creating...' : '+ Create Session'}
            </button>
          </div>

          {/* Join Session */}
          <div className="dashboard-card">
            <h3>Join Session</h3>
            <div className="dashboard-join-row">
              <input
                className="dashboard-join-input"
                type="text"
                placeholder="Paste session ID here"
                value={joinSessionId}
                onChange={(e) => setJoinSessionId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinSession()}
              />
              <button
                className="dashboard-join-btn"
                onClick={handleJoinSession}
              >
                Join
              </button>
            </div>
          </div>

        </div>

        {/* Sessions list */}
        <div className="dashboard-sessions">
          <h3>Your Sessions</h3>

          {error && <div className="dashboard-error">{error}</div>}

          {loading ? (
            <div className="dashboard-loading">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="dashboard-empty">
              No sessions yet. Create one to get started.
            </div>
          ) : (
            sessions.map((session) => (
              <div className="session-item" key={session._id}>
                <div className="session-item-info">
                  <span className="session-item-id">
                    {session.sessionId}
                  </span>
                  <div className="session-item-meta">
                    <span className="session-meta-tag">
                      Language: <span>{session.language}</span>
                    </span>
                    <span className="session-meta-tag">
                      Participants: <span>{session.participants.length}</span>
                    </span>
                    <span className="session-meta-tag">
                      Created: <span>{formatDate(session.createdAt)}</span>
                    </span>
                    <span className={`session-status ${session.isActive ? 'active' : 'ended'}`}>
                      {session.isActive ? 'Active' : 'Ended'}
                    </span>
                  </div>
                </div>
                <button
                  className="session-open-btn"
                  onClick={() => navigate(`/session/${session.sessionId}`)}
                >
                  Open →
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}

export default Dashboard