import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import socket from '../socket/socket'
import axiosInstance from '../api/axios'
import Editor from '../components/Editor'
import Chat from '../components/Chat'
import AIReview from '../components/AIReview'
import VideoPanel from '../components/VideoPanel'
import './Session.css'

const Session = () => {
  const isInitialized = useRef(false)
  const { sessionId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [participants, setParticipants] = useState([])
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('people')

  const languages = [
    'javascript', 'typescript', 'python',
    'java', 'cpp', 'c', 'go', 'rust', 'html', 'css'
  ]

  // ─── Socket connection ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return
    const token = localStorage.getItem('token')
    if (socket.connected) socket.disconnect()
    socket.auth = { token }
    socket.connect()

    socket.on('connect', () => {
      socket.emit('join-session', sessionId)
    })

    socket.on('session-state', ({ code, language }) => {
      if (!isInitialized.current) {
        setCode(code)
        setLanguage(language)
      }
    })

    socket.on('user-joined', ({ userId, username }) => {
      setParticipants((prev) => {
        if (prev.find((p) => p._id === userId)) return prev
        return [...prev, { _id: userId, username }]
      })
    })

    socket.on('user-left', ({ userId }) => {
      setParticipants((prev) => prev.filter((p) => p._id !== userId))
    })

    return () => {
      socket.emit('leave-session', sessionId)
      socket.off('connect')
      socket.off('session-state')
      socket.off('user-joined')
      socket.off('user-left')
      socket.disconnect()
    }
  }, [sessionId])

  // ─── Fetch session ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await axiosInstance.get(`/sessions/${sessionId}`)
        const { session } = response.data
        setSession(session)
        setCode(session.code)
        setLanguage(session.language)
        setParticipants(session.participants)
        isInitialized.current = true
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load session')
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [sessionId])

  // ─── Language update from others ───────────────────────────────────────────
  useEffect(() => {
    socket.on('language-update', ({ language }) => setLanguage(language))
    return () => socket.off('language-update')
  }, [])

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleLeave = () => {
    socket.emit('leave-session', sessionId)
    socket.disconnect()
    navigate('/dashboard')
  }

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value
    setLanguage(newLanguage)
    socket.emit('language-change', { sessionId, language: newLanguage })
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(sessionId)
  }

  // ─── File extension helper ─────────────────────────────────────────────────
  const getExtension = (lang) => {
    const map = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      go: 'go',
      rust: 'rs',
      html: 'html',
      css: 'css',
    }
    return map[lang] || lang
  }

  if (loading) return <div className="session-loading">Loading session...</div>
  if (error) return <div className="session-error">{error}</div>

  return (
    <div className="session-page">

      {/* ── Top bar ── */}
      <div className="session-topbar">
        <div className="session-topbar-left">

          <span className="session-logo">CodeCollab</span>
          <div className="session-topbar-divider" />
          <span className="session-id-badge">{sessionId}</span>
          <button className="session-copy-btn" onClick={handleCopyId}>
            Copy ID
          </button>
          <select
            className="session-lang-select"
            value={language}
            onChange={handleLanguageChange}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>

        </div>
        <button className="session-leave-btn" onClick={handleLeave}>
          Leave Session
        </button>
      </div>

      {/* ── Main ── */}
      <div className="session-main">

        {/* Editor panel */}
        <div className="session-editor-panel">

          {/* Mac-style titlebar */}
          <div className="editor-titlebar">
            <div className="editor-titlebar-dot" style={{ background: '#ef4444' }} />
            <div className="editor-titlebar-dot" style={{ background: '#f59e0b' }} />
            <div className="editor-titlebar-dot" style={{ background: '#22c55e' }} />
            <span className="editor-titlebar-filename">
              index.{getExtension(language)}
            </span>
          </div>

          <Editor
            sessionId={sessionId}
            code={code}
            language={language}
            onCodeChange={setCode}
          />

        </div>

        {/* Right panel */}
        <div className="session-right-panel">

          {/* Tabs */}
          <div className="session-tabs">
            {['people', 'chat', 'ai', 'video'].map((tab) => (
              <button
                key={tab}
                className={`session-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'people' ? 'People'
                  : tab === 'chat' ? 'Chat'
                  : tab === 'ai' ? 'AI Review'
                  : 'Video'}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="session-tab-content">

            {/* People tab */}
            {activeTab === 'people' && (
              <div className="participants-panel">
                <div className="participants-title">
                  In this session — {participants.length}
                </div>
                {participants.map((p, index) => (
                  <div className="participant-item" key={p._id}>
                    <div className="participant-avatar">
                      {(p.fullname?.firstname || p.username)?.charAt(0).toUpperCase()}
                    </div>
                    <div className="participant-info">
                      <span className="participant-name">
                        {p.fullname?.firstname || p.username}
                      </span>
                      <span className="participant-role">
                        {index === 0 ? 'Owner' : 'Participant'}
                      </span>
                    </div>
                    <span className="participant-online" />
                  </div>
                ))}
              </div>
            )}

            {/* Chat tab */}
            {activeTab === 'chat' && (
              <Chat sessionId={sessionId} user={user} />
            )}

            {/* AI Review tab */}
            {activeTab === 'ai' && (
              <AIReview
                sessionId={sessionId}
                code={code}
                language={language}
              />
            )}

            {/* Video tab */}
            {activeTab === 'video' && (
              <VideoPanel sessionId={sessionId} user={user} />
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default Session