const express = require('express')
const router = express.Router()
const authmiddleware = require('../middleware/auth.middleware')
const {createSessionController,singleSessionController,mysessionController,sessionMessageController} = require('../controllers/session.controller')

//---create new session---------------
router.post('/create',authmiddleware, createSessionController )

// ─── Get all sessions owned by logged-in user ─────────────────────────────────
router.get('/my-sessions', authmiddleware, mysessionController );

//---Get all messages after joining a particular session-------
router.get('/:sessionId/messages',authmiddleware,sessionMessageController)

// ─── Get a single session by sessionId ───────────────────────────────────────
router.get('/:sessionId', authmiddleware,singleSessionController );

module.exports = router