// Load environment variables
require('dotenv').config();

// Imports required (dependencies)
const express = require('express');
const path = require('path');
const errorHandler = require('./backend/middleware/errorHandler');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./backend/swagger/swagger-output.json');
const cors = require('cors');
const passport = require("passport");

// Import route db
const { initDb } = require('./backend/db/connect');
// Import route customers
const customerRoutes = require('./backend/routes/customers');
// Import route products
const productsRoutes = require('./backend/routes/products.js');
// Import route authentication
const authRoutes = require('./backend/routes/authentication.js');//jwt

const oauthRoutes = require('./backend/routes/oauth.js');//github aouthen

// Create express app
const app = express();
//Oauth github
app.use(passport.initialize());
// Middleware to parse JSON
app.use(express.json());

// Allow all origins with CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// -------------------- REGISTER API ROUTES (BEFORE STATIC FILES) --------------------

// Customers routes
app.use('/customers', customerRoutes);

// Products routes
app.use('/products', productsRoutes);

// Authentication routes
app.use('/auth', authRoutes);

// OAuth placeholder
app.use('/auth', oauthRoutes);



// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile, { explorer: true }));

// -------------------- STATIC FRONTEND MUST COME LAST --------------------

app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// -------------------- GLOBAL ERROR HANDLER --------------------
app.use(errorHandler);

// Get PORT from environment or default PORT 8080
const PORT = process.env.PORT || 8080;

// Start database first, then server
if (process.env.NODE_ENV !== "test") {
  initDb((err) => {
    if (err) {
      console.error("Failed to connect to MongoDB:", err.message);
      process.exit(1); // Stop server
    }

    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Swagger Docs: http://localhost:${PORT}/api-docs`);
    });
  });
}

module.exports = app;
