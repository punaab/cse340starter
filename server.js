/* ***********************
 * Primary Server File (server.js)
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

const app = express();

app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");
app.use(express.static("public"));

app.use(session({
  store: new (require("connect-pg-simple")(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET || "default_secret",
  resave: false,
  saveUninitialized: false,
  name: "sessionId",
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  },
}));
app.use(flash());
app.use((req, res, next) => {
  const flashMessages = req.flash();
  console.log(`[Middleware] ${req.method} ${req.url} - Session ID:`, req.sessionID);
  console.log(`[Middleware] ${req.method} ${req.url} - Session before flash:`, req.session);
  console.log(`[Middleware] ${req.method} ${req.url} - Raw flash:`, req.flash());
  res.locals.messages = flashMessages;
  console.log(`[Middleware] ${req.method} ${req.url} - res.locals.messages:`, res.locals.messages);
  res.locals.loggedIn = !!req.session.loggedIn;
  res.locals.account_firstname = req.session.account_firstname || "";
  res.locals.account_id = req.session.account_id || null;
  res.locals.account_type = req.session.account_type || "Client";
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(utilities.checkJWTToken);
app.use(utilities.attachUnreadMessageCount);

// Routes
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const staticRoute = require("./routes/static");
const messageRoute = require("./routes/messageRoute");

app.get("/", utilities.handleErrors(baseController.buildHome));
app.use("/inv", inventoryRoute);
app.use("/account", accountRoute);
app.use("/static", staticRoute);
app.use("/messages", messageRoute);

// Error handling
app.use(async (req, res, next) => {
  try {
    const nav = await utilities.getNav(req, res);
    res.status(404).render("errors/error", {
      title: "404 - Page Not Found",
      message: "Sorry, we appear to have lost that page.",
      nav,
    });
  } catch (err) {
    next(err);
  }
});
app.use(async (err, req, res, next) => {
  console.error("[ERROR] Caught in global handler:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });
  try {
    const nav = await utilities.getNav(req, res);
    res.status(err.status || 500).render("errors/error", {
      title: err.status === 404 ? "404 - Page Not Found" : "500 - Server Error",
      message: err.message || "Something went wrong on our end.",
      nav,
    });
  } catch (navErr) {
    console.error("[ERROR] Failed to render error page:", navErr);
    res.status(500).send("Internal Server Error");
  }
});

// Start server
const PORT = process.env.PORT || 5500;
const HOST = process.env.HOST || "localhost";
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
});