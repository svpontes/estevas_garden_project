const express = require('express');
const jwt = require('jsonwebtoken');
const User = require("../model/user");
const auth = require("../middleware/auth");
const rateLimit = require("express-rate-limit");
const router = express.Router();

// ---- LOGIN RATE LIMITER (prevents brute force) ----
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 5, // 5 tentativas
  message: { error: "Too many login attempts. Try again later." }
});

// ---- SIMPLE VALIDATION FUNCTION ----
function validateUserInput(name, email, password) {
  if (!email || !password) return "Email and password are required.";
  if (email.length < 6 || !email.includes("@")) return "Invalid email format.";
  if (password.length < 6) return "Password must be at least 6 characters.";
  if (name && name.length < 2) return "Name too short.";
  return null;
}

// ----------------- REGISTER -----------------
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // sanitize input
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();

    // Validate
    const validationError = validateUserInput(cleanName, cleanEmail, password);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const newUser = await User.register(cleanName, cleanEmail, password);

    res.status(201).json({
      message: "User registered successfully!",
      userId: newUser._id
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ------------------- LOGIN -------------------
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = String(email).toLowerCase().trim();

    const foundUser = await User.validatePassword(cleanEmail, password);

    if (!foundUser) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: foundUser._id, email: foundUser.email, name: foundUser.name },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ 
      message: "Login successful", 
      token 
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------------- PROTECTED PROFILE ROUTE ----------------
router.get("/profile", auth, async (req, res) => {
  res.json({
    userId: req.user.userId,
    email: req.user.email,
    name: req.user.name
  });
});

// ------------------ DEBUG DB ROUTE -----------------
const { getDb } = require("../db/connect");
router.get("/debug-db", (req, res) => {
  try {
    const db = getDb();
    res.json({ connectedTo: db.databaseName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
