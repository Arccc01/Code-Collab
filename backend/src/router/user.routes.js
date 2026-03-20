const express = require("express");
const router = express.Router();
const passport = require('passport')
const {
  userRegister,
  userlogin,
  userlogout,
  redirectController,
} = require("../controllers/user.controller");

router.post("/register", userRegister);
router.post("/login", userlogin);
router.post("/logout", userlogout);

// ─── Google OAuth routes ───────────────────────────────────────────────────

// Step 1 — Redirect user to Google login page
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

// Step 2 — Google redirects back here after login
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed`,
    session: false,
  }),redirectController
);

module.exports = router;
