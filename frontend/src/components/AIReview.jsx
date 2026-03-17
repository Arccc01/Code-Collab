import { useState } from 'react'
import axiosInstance from '../api/axios'

const AIReview = ({ sessionId, code, language }) => {
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [cooldown, setCooldown] = useState(false)

  const handleReview = async () => {
    if (!code || code.trim() === '') {
      setError('No code to review')
      return
    }
    if (cooldown) {
      setError('Please wait before requesting another review')
      return
    }
    try {
      setLoading(true)
      setError(null)
      setReview(null)
      const response = await axiosInstance.post('/ai/review', {
        sessionId, code, language,
      })
      setReview(response.data.review)
      setCooldown(true)
      setTimeout(() => setCooldown(false), 30000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ai-panel">

      <div className="ai-header">
        <span className="ai-title">AI Code Review</span>
        <span className="ai-powered-by">Powered by Gemini</span>
      </div>

      <span className="ai-lang-badge">{language}</span>

      <button
        className="ai-review-btn"
        onClick={handleReview}
        disabled={loading || cooldown || !code}
      >
        {loading ? 'Reviewing...' : cooldown ? 'Wait 30s...' : 'Review Code'}
      </button>

      {error && <div className="ai-error">{error}</div>}

      {review && (
        <div className="ai-result">
          <pre>{review}</pre>
        </div>
      )}

      {!review && !loading && !error && (
        <div className="ai-empty">
          Click Review Code to get AI feedback on the current code.
        </div>
      )}

    </div>
  )
}

export default AIReview