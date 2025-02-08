/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const baseController = require("./controllers/baseController");
const pool = require("./database");
const utilities = require("./utilities/");
const inventoryRoute = require('./routes/inventoryRoute');
const static = require('./routes/static');



const app = express();

/* ***********************
 * View Engines and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");// not at views root

/* ***********************
 * Routes
 *************************/
app.use(require(".routes/static"));
// app.get('/', utilities.handleErrors(baseController.buildHome))

app.get('/', baseController.buildHome);

// Inventory routes
app.use("/inv", inventoryRoute);

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
