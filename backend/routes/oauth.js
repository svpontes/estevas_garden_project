const express = require("express");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const router = express.Router();

// Configure Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0]?.value;
        const name = profile.displayName || profile.username;

        let user = await User.findByEmail(email);

        if (!user) {
          user = await User.register(name, email, crypto.randomUUID());
          user.oauthProvider = "github";
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Required passport methods
passport.serializeUser((user, done) => done(null, user.email));
passport.deserializeUser(async (email, done) =>
  done(null, await User.findByEmail(email))
);

// GitHub Login Route
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

// GitHub Callback
router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/?login=failed" }),
  (req, res) => {
    
    const token = jwt.sign(
      { email: req.user.email, name: req.user.name },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.redirect(`/?token=${token}`);
  }
);

module.exports = router;
