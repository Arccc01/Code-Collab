const express = require('express')
const app = express()
const userRoutes = require('./router/user.routes')
const sessionRoutes = require('./router/session.routes.js')
const aiRoutes = require('./router/ai.routes.js')
const cookieParser = require("cookie-parser");

app.use(express.json())
app.use(cookieParser())
app.use('/auth',userRoutes)
app.use('/session',sessionRoutes)
app.use('/ai',aiRoutes)


module.exports = app