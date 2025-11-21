// Load environment variables
require('dotenv').config();

// Imports required (dependencies)
const express = require('express');
const path = require('path');
const errorHandler = require('./backend/middleware/errorHandler');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./backend/swagger/swagger-output.json');
//cors
const cors = require('cors');

// Import route db
const { initDb } = require('./backend/db/connect');
// Import route customers
const customerRoutes = require('./backend/routes/customers');
//Import route products
const productsRoutes = require('./backend/routes/products.js');
//import route authentication
const authRoutes = require('./backend/routes/authentication.js')
// Create express app
const app = express();

// Middleware to parse JSON
app.use(express.json());

//alolow all origins //
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authoriztion']
}));
// Serve static frontend files
app.use(express.static(path.join(__dirname, 'frontend')));

// Basic route (homepage)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Register API routes customers
app.use('/customers', customerRoutes);

//Register API routes products
app.use('/products', productsRoutes);

//Register API routes authentication
app.use('/auth', authRoutes);

// Swagger API doc
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile, { explorer: true }));

// GLOBAL ERROR HANDLER (must be after all routes)
app.use(errorHandler);

// Get PORT from environment or default PORT 8080
const PORT = process.env.PORT || 8080;

/**
 * Start server conditionally:
 * - If NODE_ENV === "test": do NOT start server.
 * - Otherwise: initialize DB first, then start server.
 */
if (process.env.NODE_ENV !== "test") {
  initDb((err) => {
    if (err) {
      console.error("Failed to connect to MongoDB:", err.message);
      process.exit(1); // Stop server, avoids running API without DB
    }

    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Swagger Docs: http://localhost:${PORT}/api-docs`);
    });
  });
}

module.exports = app;
