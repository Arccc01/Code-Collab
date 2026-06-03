import { useState, useEffect, useRef } from 'react'
import socket from '../socket/socket'
import axiosInstance from '../api/axios'

const Chat = ({ sessionId, user }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom() }, [messages])

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axiosInstance.get(`/sessions/${sessionId}/messages`)
        setMessages(response.data.messages)
      } catch (err) {
        console.error('Failed to load messages', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMessages()
  }, [sessionId])

  useEffect(() => {
    socket.on('receive-message', (message) => {
      setMessages((prev) => [...prev, message])
    })
    return () => socket.off('receive-message')
  }, [])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    socket.emit('send-message', { sessionId, content: newMessage.trim() })
    setNewMessage('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isOwnMessage = (message) => message.sender._id === user._id

  return (
    <div className="chat-panel">

      <div className="chat-messages">
        {loading ? (
          <div className="chat-loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">No messages yet. Start the conversation.</div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`chat-message ${isOwnMessage(message) ? 'own' : 'other'}`}
            >
              <span className="chat-sender">
                {isOwnMessage(message) ? 'You' : message.sender.username}
              </span>
              <div className="chat-bubble">{message.content}</div>
              <span className="chat-time">{formatTime(message.createdAt)}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <input
          className="chat-input"
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="chat-send-btn"
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          Send
        </button>
      </div>

    </div>
  )
}

export default Chat
