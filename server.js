/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const env = require("dotenv").config();
const app = express();
// const static = require("./routes/static")
const expressLayouts = require("express-ejs-layouts");
const port = process.env.PORT;
const host = process.env.HOST;
const baseController = require("./controllers/baseController");
const inventoryRoute = require('./routes/inventoryRoute');

/* ***********************
 * Routes
 *************************/
// app.use(static)
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

/* ***********************
 * Added Static MiddleWare (Israel's Way of Solving)
 *************************/
app.use(express.static("public"))

/* ***********************
 * Index Route
 *************************/
app.get("/", baseController.buildHome)

// Inventory routes
app.use("/inv", inventoryRoute)

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
// const port = process.env.PORT
// const host = process.env.HOST
// const baseController = require("./controllers/baseController");

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
});
