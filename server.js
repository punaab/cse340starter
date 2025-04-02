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
const cookieParser = require("cookie-parser");
const utilities = require("./utilities");

// Import Routes & Controllers
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const staticRoute = require("./routes/static");
const messageRoute = require("./routes/messageRoute"); 

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
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1-day session
    },
  })
); // Removed duplicate session middleware

/* ***********************
 * Flash Messages Middleware
 *************************/
app.use(flash());

/* ***********************
 * Body Parser Middleware
 *************************/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* ***********************
 * Cookie Middleware
 *************************/
app.use(cookieParser());

/* ***********************
 * Utility Middleware
 *************************/
app.use(utilities.checkJWTToken);
app.use(utilities.attachUnreadMessageCount); // Fixed import syntax

app.use((req, res, next) => {
  console.log(`[Middleware] URL: ${req.url}, Session:`, req.session);
  res.locals.messages = req.flash(); // Set flash messages once
  res.locals.loggedIn = req.session.loggedIn || false;
  res.locals.account_firstname = req.session.account_firstname || "";
  res.locals.account_id = req.session.account_id || null;
  res.locals.account_type = req.session.account_type || "Client";
  console.log("[Middleware] res.locals:", res.locals);
  next();
});

/* ***********************
 * View Engine Setup
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Serve Static Files
 *************************/
app.use(express.static("public"));

/* ***********************
 * Routes
 *************************/
app.get("/", utilities.handleErrors(baseController.buildHome));
app.use("/inv", inventoryRoute);
app.use("/account", accountRoute);
app.use("/static", staticRoute);
app.use("/messages", messageRoute);

/* ***********************
 * 404 Error Handling Middleware
 *************************/
app.use(async (req, res, next) => {
  const nav = await utilities.getNav(req, res);
  next({ status: 404, message: "Sorry, we appear to have lost that page.", nav });
});

/* ***********************
 * Global Error Handling Middleware
 *************************/
app.use(async (err, req, res, next) => {
  console.error("[ERROR HANDLER] An error occurred:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
  });
  let nav = err.nav || await utilities.getNav(req, res);
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