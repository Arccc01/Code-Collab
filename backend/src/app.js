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

console.log("Backend is running on port 3000,",path.join(__dirname, "public", "index.html"));


// ─── Passport ─────────────────────────────────────────────────────────────
app.use(passport.initialize())
app.use(passport.session())

app.use("/api/auth", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/ai", aiRoutes);

// React catch-all route 
app.use(express.static(path.join(__dirname, "public")));
app.get("/*path", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});
console.log("Backend is running on port 3000,",path.join(__dirname, "public"));

module.exports = app;
