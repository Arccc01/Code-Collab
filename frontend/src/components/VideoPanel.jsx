// src/components/VideoPanel.jsx

import { useEffect, useRef, useState } from 'react'
import Peer from 'peerjs'
import socket from '../socket/socket'

const VideoPanel = ({ sessionId, user }) => {
  const [peers, setPeers] = useState({})
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [error, setError] = useState(null)

  const peerInstance = useRef(null)
  const localStreamRef = useRef(null)
  const localVideoRef = useRef(null)
  const remoteVideoRefs = useRef({})

  useEffect(() => {
    const initPeer = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true, audio: true,
        })
        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        const peer = new Peer()
        peerInstance.current = peer

        peer.on('open', (id) => {
          socket.emit('peer-ready', { sessionId, peerId: id })
        })

        peer.on('call', (call) => {
          call.answer(stream)
          call.on('stream', (remoteStream) => addRemoteStream(call.peer, remoteStream))
          call.on('close', () => removeRemoteStream(call.peer))
        })

        peer.on('error', (err) => {
          console.error('PeerJS error:', err)
          setError('Video connection error')
        })

        socket.on('user-peer-ready', ({ peerId: remotePeerId }) => {
          const call = peer.call(remotePeerId, stream)
          call.on('stream', (remoteStream) => addRemoteStream(remotePeerId, remoteStream))
          call.on('close', () => removeRemoteStream(remotePeerId))
          setPeers((prev) => ({ ...prev, [remotePeerId]: call }))
        })

      } catch (err) {
        console.error('Media error:', err)
        setError('Could not access camera or microphone')
      }
    }

    initPeer()

    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop())
      peerInstance.current?.destroy()
      socket.off('user-peer-ready')
    }
  }, [sessionId])

  const addRemoteStream = (peerId, stream) => {
    if (remoteVideoRefs.current[peerId]) {
      remoteVideoRefs.current[peerId].srcObject = stream
    }
    setPeers((prev) => ({ ...prev, [peerId]: stream }))
  }

  const removeRemoteStream = (peerId) => {
    setPeers((prev) => {
      const updated = { ...prev }
      delete updated[peerId]
      return updated
    })
  }

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled
    })
    setIsMuted((prev) => !prev)
  }

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled
    })
    setIsVideoOff((prev) => !prev)
  }

  return (
    <div className="video-panel">

      {error && <div className="video-error">{error}</div>}

      <div className="video-grid">

        {/* Local video */}
        <div className="video-box">
          <video ref={localVideoRef} autoPlay muted playsInline />
          <span className="video-label">You ({user?.username})</span>
        </div>

        {/* Remote videos */}
        {Object.keys(peers).map((remotePeerId) => (
          <div className="video-box" key={remotePeerId}>
            <video
              ref={(el) => { if (el) remoteVideoRefs.current[remotePeerId] = el }}
              autoPlay
              playsInline
            />
            <span className="video-label">Participant</span>
          </div>
        ))}

      </div>

      <div className="video-controls">
        <button
          className={`video-ctrl-btn ${isMuted ? 'active' : ''}`}
          onClick={toggleMute}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <button
          className={`video-ctrl-btn ${isVideoOff ? 'active' : ''}`}
          onClick={toggleVideo}
        >
          {isVideoOff ? 'Cam On' : 'Cam Off'}
        </button>
      </div>

    </div>
  )
}

export default VideoPanel