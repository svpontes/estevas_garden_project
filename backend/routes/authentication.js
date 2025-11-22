const express = require('express');
const jwt = require('jsonwebtoken');
const User = require("../model/user");
const auth = require("../middleware/auth");
const router = express.Router();




// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newUser = await User.register(name, email, password);
    
    res.status(201).json({
      message: "User registered successfully!",
      userId: newUser._id
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const foundUser = await User.validatePassword(email, password);

    if (!foundUser) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // JWT token generation
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

// Protected Route
router.get("/profile", auth, async (req, res) => {
  res.json({
    userId: req.user.userId,
    email: req.user.email,
    name: req.user.name
  });
});

//test route

const { getDb } = require("../db/connect");

router.get("/debug-db", (req, res) => {
  try {
    const db = getDb();
    res.json({ connectedTo: db.databaseName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//************************************************* */

module.exports = router;
