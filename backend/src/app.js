const express = require("express");
const app = express();
const userRoutes = require("./router/user.routes");
const sessionRoutes = require("./router/session.routes.js");
const aiRoutes = require("./router/ai.routes.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require('express-session')
const passport = require('./config/passport.js')
const path = require("path");

app.use(express.json());
app.use(cookieParser());
// app.use(cors({ origin:process.env.VITE_URL,credentials:true}));
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

app.use("/api/auth", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/ai", aiRoutes);

// Google OAuth callback directly on root path (without /api prefix) to match Google Console setting
const { redirectController } = require("./controllers/user.controller");
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login?error=google_failed",
    session: false,
  }),
  redirectController
);

// React catch-all route 
app.use(express.static(path.join(__dirname, "public")));
app.get("/*path", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

module.exports = app;
