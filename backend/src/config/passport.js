const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value
        const firstname = profile.name.givenName
        const lastname = profile.name.familyName || ''
        const avatar = profile.photos[0]?.value || null
        const googleId = profile.id
        // 1. Check if user already exists by googleId
        let user = await userModel.findOne({ googleId })

        if (!user) {
          // 2. Check if user exists by email (registered normally before)
          user = await userModel.findOne({ email })

          if (user) {
            // 3. Existing normal user — link their Google account
            user.googleId = googleId
            user.avatar = avatar
            await user.save()
          } else {
            // 4. Brand new user — create from Google profile
            // Auto-generate username from name + random number
            const baseUsername = `${firstname}${lastname}`
              .toLowerCase()
              .replace(/\s+/g, '')
            const randomSuffix = Math.floor(Math.random() * 9000) + 1000
            const username = `${baseUsername}${randomSuffix}`

            user = await userModel.create({
              googleId,
              email,
              avatar,
              username,
              fullname: {
                firstname,
                lastname,
              },
            })
          }
        }

        return done(null, user)

      } catch (err) {
        return done(err, null)
      }
    }
  )
)

// Serialize and deserialize are required by Passport
// even though we use JWT — not sessions
passport.serializeUser((user, done) => done(null, user._id))
passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id)
    done(null, user)
  } catch (err) {
    done(err, null)
  }
})

module.exports = passport
