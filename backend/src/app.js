const express = require("express");
const app = express();
const userRoutes = require("./router/user.routes");
const sessionRoutes = require("./router/session.routes.js");
const aiRoutes = require("./router/ai.routes.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require('express-session')
const passport = require('./config/passport.js')

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin:process.env.VITE_URL,credentials:true}));
// ─── Session (required by Passport even with JWT) ─────────────────────────
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
)
// ─── Passport ─────────────────────────────────────────────────────────────
app.use(passport.initialize())
app.use(passport.session())

app.use("/auth", userRoutes);
app.use("/sessions", sessionRoutes);
app.use("/ai", aiRoutes);

module.exports = app;
