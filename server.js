/* ******************************************
 * Primary Server File (server.js)
 * Controls the entire project
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const pool = require("./database/");
const dotenv = require("dotenv").config();
const session = require("express-session");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")
const utilities = require("./utilities");
const validation = require("./middleware/validation");


// Import Routes & Controllers
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const staticRoute = require("./routes/static");

/* ***********************
 * Initialize Express App
 *************************/
const app = express();

/* ***********************
 * Session Middleware (Secure Sessions)
 *************************/
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true, // Auto-create session table if missing
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // Improve security by preventing empty sessions
    name: "sessionId",
    cookie: {
      secure: process.env.NODE_ENV === "production", // Secure cookies in production
      httpOnly: true, // Helps prevent XSS attacks
      maxAge: 1000 * 60 * 60 * 24, // 1-day session
    },
  })
);

/* ***********************
 * Flash Messages Middleware
 *************************/
app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

/* ***********************
 * Body Parser Middleware
 *************************/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Parses `application/x-www-form-urlencoded` data

/* ***********************
 * Cookie Middleware
 *************************/
app.use(cookieParser())

/* ***********************
 * View Engine Setup
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // Sets layout file

/* ***********************
 * Serve Static Files
 *************************/
app.use(express.static("public"));

/* ***********************
 * Routes
 *************************/

// Home Route
app.get("/", utilities.handleErrors(baseController.buildHome));

// Inventory Routes
app.use("/inv", inventoryRoute);

// Account Routes
app.use("/account", accountRoute);

// Static Pages
app.use("/static", staticRoute);

/* ***********************
 * 404 Error Handling Middleware
 * Handles unmatched routes
 *************************/
app.use((req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

/* ***********************
 * Global Error Handling Middleware
 *************************/
app.use(async (err, req, res, next) => {
  console.error("[ERROR HANDLER] An error occurred:", err);

  let nav = await utilities.getNav();
  res.status(err.status || 500).render("errors/error", {
    title: err.status === 404 ? "404 - Page Not Found" : "500 - Server Error",
    message: err.message || "Something went wrong.",
    nav,
  });
});

/* ***********************
 * Server Startup
 *************************/
const PORT = process.env.PORT || 5500;
const HOST = process.env.HOST || "localhost";

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
});
