// -------------------- ENVIRONMENT VARIABLES --------------------
require('dotenv').config();

// -------------------- IMPORTS --------------------
const express = require('express');
const passport = require("passport");
const path = require('path');
const errorHandler = require('./backend/middleware/errorHandler');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./backend/swagger/swagger-output.json');
const cors = require('cors');

// DB connection function
const { initDb } = require('./backend/db/connect');

// Routes
const customerRoutes = require('./backend/routes/customers');
const productsRoutes = require('./backend/routes/products.js');
const authRoutes = require('./backend/routes/authentication.js');  // JWT login/register
const oauthRoutes = require('./backend/routes/oauth.js');          // GitHub login

// -------------------- EXPRESS APP --------------------
const app = express();

// Security / Auth Middleware (must run BEFORE routes)
app.use(passport.initialize());

// Body parser for JSON requests
app.use(express.json());

// -------------------- CORS POLICY --------------------
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// -------------------- API ROUTES (must be BEFORE frontend files) --------------------
app.use('/customers', customerRoutes);
app.use('/products', productsRoutes);
app.use('/auth', authRoutes);
app.use('/auth', oauthRoutes);  // same prefix for OAuth

// -------------------- SWAGGER DOCS --------------------
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile, { explorer: true }));

// -------------------- STATIC FRONTEND --------------------
app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// -------------------- GLOBAL ERROR HANDLER --------------------
app.use(errorHandler);

// -------------------- SERVER START --------------------
const PORT = process.env.PORT || 8080;

if (process.env.NODE_ENV !== "test") {
  initDb((err) => {
    if (err) {
      console.error("Failed to connect to MongoDB:", err.message);
      process.exit(1);
    }

    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Swagger Docs: http://localhost:${PORT}/api-docs`);
    });
  });
}

module.exports = app;
