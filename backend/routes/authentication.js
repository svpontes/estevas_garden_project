const express = require('express');
const jwt = require('jsonwebtoken');
const User = require("../model/user");
const auth = require("../middleware/auth");
const { getDb } = require("../db/connect");
const router = express.Router();

//registering
router.post("/register", async (req, res) => {
   
    try {
        const { name, email, password } = req.body;
        const user = await user.register(name, email, password);
        res.status(201).json({ message: "User registered successfullly!" });
        
    } catch (err) {
        res.status(400).json({ error: err.message });
        }
        
});

//login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await user.validatePassword(email, password);

        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({ message: "Login successful", token });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// profile route (protected)
router.get("/profile", auth, async (req, res) => {
    res.json({ message: `Authenticated request. User: ${req.user.email}` });
});

module.exports = router;