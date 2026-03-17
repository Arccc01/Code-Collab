import { useEffect, useRef } from 'react'
import MonacoEditor from '@monaco-editor/react'
import socket from '../socket/socket'

const Editor = ({ sessionId, code, language, onCodeChange }) => {
  const editorRef = useRef(null)
  const isRemoteChange = useRef(false)

  // ─── Listen for code updates from other users ────────────────────────────
  useEffect(() => {
    socket.on('code-update', ({ code }) => {
      if (editorRef.current) {
        isRemoteChange.current = true
        editorRef.current.setValue(code)
        // ✅ reset flag after a tick, not immediately
        // gives Monaco time to fire onChange before we reset
        setTimeout(() => {
          isRemoteChange.current = false
        }, 0)
      }
    })

    return () => {
      socket.off('code-update')
    }
  }, [])


  // ─── When editor mounts, store the editor instance ──────────────────────
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor
  }


  // ─── When editor content changes ────────────────────────────────────────
  const handleEditorChange = (value) => {
    if (isRemoteChange.current) return

    onCodeChange(value)
    socket.emit('code-change', { sessionId, code: value })
  }


  return (
    <MonacoEditor
      height="100vh"
      language={language}
      defaultValue={code}   // ✅ changed from value to defaultValue
      theme="vs-dark"
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        automaticLayout: true,
      }}
    />
  )
}

export default Editor