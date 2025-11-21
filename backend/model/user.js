const bcrypt = require("bcrypt");
const { getDb } = require("../db/connect");

const COLLECTION_NAME = "users";

class User {
    constructor(name, email, password, role = "user") {
        this.name = name;
        this.email = email;
        this.password = password; // hashed password
        this.role = role;
        this.isVerified = false;
        this.createdAt = new Date();
    }

    // Register a new user
    // Register a new user
static async register(name, email, password) {
    const db = getDb();

    // Check if user already exists
    const exists = await db.collection(COLLECTION_NAME).findOne({ email });
    if (exists) {
        throw new Error("Email already registered");
    }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user instance
        const newUser = new User(name, email, hashedPassword);

        // Save to DB
        await db.collection(COLLECTION_NAME).insertOne(newUser);

    return {
            
        _id: result.insertedId, 
        name: newUser.name, 
        email: newUser.email, 
        createdAt: newUser.createdAt
        };
    }

    // Find user by email
    static async findByEmail(email) {
        const db = getDb();
        return await db.collection(COLLECTION_NAME).findOne({ email });
    }

    // Validate user password during login
    static async validatePassword(email, password) {
        const user = await User.findByEmail(email);
        if (!user) return false;

        const isValid = await bcrypt.compare(password, user.password);

        return isValid ? user : false;
    }
}

module.exports = User;
