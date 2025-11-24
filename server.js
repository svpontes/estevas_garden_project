require("dotenv").config();

// Imports
const express = require("express");
const passport = require("passport");
const path = require("path");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./backend/swagger/swagger-output.json");
const errorHandler = require("./backend/middleware/errorHandler");


// DB Connection
const { initDb } = require("./backend/db/connect");

// Routes
const customerRoutes = require("./backend/routes/customers");
const productsRoutes = require("./backend/routes/products");
const authRoutes = require("./backend/routes/authentication");
const oauthRoutes = require("./backend/routes/oauth");

const app = express();

// -------------------- MIDDLEWARE --------------------
app.use(express.json());
app.use(cors());
const session = require("express-session");

app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// -------------------- ROUTES --------------------
app.use("/auth", authRoutes); // JWT login/register
app.use("/auth", oauthRoutes); // GitHub OAuth under same prefix
app.use("/customers", customerRoutes);
app.use("/products", productsRoutes);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// -------------------- FRONTEND --------------------
app.use(express.static(path.join(__dirname, "frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// -------------------- ERROR HANDLER --------------------
app.use(errorHandler);

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 8080;

initDb((err) => {
  if (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }

  console.log("✔ MongoDB connected");

  app.listen(PORT, () => {
    console.log(`Server running at: http://localhost:${PORT}`);
    console.log(`Swagger: http://localhost:${PORT}/api-docs`);
  });
});

module.exports = app;



