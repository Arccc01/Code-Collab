const express = require('express')
const router = express.Router()
const authmiddleware = require('../middleware/auth.middleware')
const reviewController = require('../controllers/ai.controller')

// ─── POST /api/ai/review ───────────────────────────────────────────────────────
router.post('/review', authmiddleware,reviewController)


module.exports = router