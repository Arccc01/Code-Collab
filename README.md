# ⬡ CodeCollab

> A real-time collaborative coding platform for remote pair programming with AI-driven code reviews.

![CodeCollab](https://img.shields.io/badge/CodeCollab-v1.0-111318?style=for-the-badge&logo=visual-studio-code&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)

---

## What is CodeCollab?

Remote teams and students often struggle with seamless pair programming and getting instant code feedback. Switching between multiple tools for video calls, chat, and code sharing breaks the flow of collaboration.

**CodeCollab solves this** by bringing everything into one unified session — a shared code editor, live chat, video calling, and AI-powered code review, all in real time.

---

## Features

### Real-time Collaborative Editor
Write code together with your team. Every keystroke is synced instantly across all participants using Monaco Editor — the same editor that powers VS Code. Switch between 10 programming languages and everyone's editor updates simultaneously.

### In-session Chat
Communicate without leaving the platform. Chat messages are delivered in real time and persisted to the database so you can scroll back through the conversation history even after joining late.

### AI Code Review
Get instant feedback on your code powered by Google Gemini. Click the Review button and Gemini analyzes your code for bugs, bad practices, and improvements — returning a structured review with Issues Found, Suggestions, and an Overall Summary.

### Video & Audio
See and hear your pair programming partner with peer-to-peer video and audio powered by WebRTC via PeerJS. Toggle your microphone or camera on and off at any time during the session.

### Session Management
Create a session with one click and share the session ID with anyone. Join existing sessions by pasting a session ID. View all your past and active sessions from the dashboard with their language, participant count, and status.

### Secure Authentication
Register and log in with JWT-based authentication. Your session persists across browser refreshes. All API routes and socket connections are protected — unauthenticated requests are rejected.

---

## Demo

| Page | Description |
|---|---|
| Register / Login | Create an account or sign in |
| Dashboard | View your sessions, create new ones, join by ID |
| Session | Code together, chat, review with AI, video call |

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React + Vite | Fast dev experience, component-based UI |
| Code Editor | Monaco Editor | VS Code quality editing experience |
| Real-time | Socket.io | Reliable WebSocket with fallback |
| Backend | Node.js + Express | Fast, non-blocking REST API |
| Database | MongoDB + Mongoose | Flexible schema for sessions and messages |
| AI | Google Gemini API | Fast, accurate code analysis |
| Video | WebRTC via PeerJS | P2P video without a media server |
| Auth | JWT + bcryptjs | Stateless, secure authentication |

---

## How to Use

**1. Create an account** — Register with your name, username, email and password.

**2. Create a session** — Click "Create Session" on the dashboard. You will be taken directly into the session room.

**3. Invite someone** — Copy the Session ID from the top bar and share it. Anyone with an account can paste it in the "Join Session" field on the dashboard.

**4. Code together** — Both users see the same editor. Type and it syncs instantly.

**5. Chat** — Switch to the Chat tab on the right panel to send messages.

**6. Get AI feedback** — Switch to the AI Review tab and click "Review Code". Gemini will analyze what is in the editor.

**7. Video call** — Switch to the Video tab. Allow camera and microphone permissions and you will see each other live.

---

## Project Structure

```
codecollab/
├── frontend/               # React frontend (Vite)
│   └── src/
│       ├── pages/        # Login, Register, Dashboard, Session
│       ├── components/   # Editor, Chat, AIReview, VideoPanel
│       ├── context/      # AuthContext
│       ├── socket/       # Socket.io client instance
│       ├── api/          # Axios instance with interceptor
│       └── styles/       # Plain CSS files
└── backend/               # Node.js + Express backend
    ├── models/           # User, Session, Message schemas
    ├── routes/           # Auth, Session, AI routes
    ├── middleware/       # JWT auth middleware
    ├── socket/           # Socket.io event handlers
    └── config/           # DB connection, Gemini client
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Port the Express server runs on |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `GEMINI_API_KEY` | Google Gemini API key from AI Studio |

---

## License

[MIT](LICENSE)

---

<div align="center">
  Built with love for developers who code together
</div>
