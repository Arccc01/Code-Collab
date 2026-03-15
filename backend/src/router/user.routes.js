const express = require('express')
const router = express.Router()
const {userRegister,userlogin,userlogout} = require('../controllers/user.controller')

router.post('/register',userRegister)
router.post('/login',userlogin)
router.post('/logout',userlogout)

module.exports = router
