const express = require("express");
const passport = require("passport");
const GitHubStrategy = require("passport-github").Strategy;
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const crypto = require("crypto"); // <-- necessário
const router = express.Router();

console.log("OAuth config:", {
  clientID: process.env.GITHUB_CLIENT_ID,
  callbackURL: process.env.GITHUB_CALLBACK_URL
});

// Configure Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ["user:email"],
      state:false,
      customHeaders: {
        Accept: "application/json",
        "User-Agent": "EstevasGardenApp"
      }
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let email;

        if (profile.emails && profile.emails.length > 0) {
          email = profile.emails[0].value;
        } else {
          const fetch = require("node-fetch");
          const response = await fetch("https://api.github.com/user/emails", {
            headers: {
              Authorization: `token ${accessToken}`,
              "User-Agent": "EstevasGardenApp",
              Accept: "application/vnd.github+json"
            },
          });

          const emails = await response.json();
          const primary = emails.find(e => e.primary && e.verified);
          email = primary ? primary.email : `${profile.username}@github.local`;
        }

        let user = await User.findByEmail(email);
        if (!user) {
          user = await User.register(profile.username, email, require("crypto").randomUUID());
        }

        return done(null, user);
      } catch (err) {
        done(err);
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
