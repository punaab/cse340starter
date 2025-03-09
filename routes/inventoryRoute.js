const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const validation = require("../middleware/validation"); // Import validation middleware

// Route for Viewing Inventory by Classification ID
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route for Viewing Inventory Item Details
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId));

// Management View Route
router.get("/", utilities.handleErrors(invController.buildManagement));

// Route for Adding a New Classification
router.get("/add-classification", utilities.handleErrors(invController.buildNewClassification));

// Route to Get Inventory as JSON (Updated per instructions)
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryByClassificationId));

// Route to Process Adding a Classification
router.post(
  "/add-classification",
  validation.checkClassificationName, // Middleware to validate classification name
  utilities.handleErrors(invController.addClassification)
);

// Route for Adding New Inventory
router.get("/new-inventory", utilities.handleErrors(invController.buildNewInventory));
router.post("/new-inventory", utilities.handleErrors(invController.addNewInventory));

module.exports = router;


// Route to build inventory by classification view


// const express = require('express');
// const router = express.Router();
// const inventoryController = require('../controllers/baseController.js');

// // Route for viewing a specific vehicle
// router.get('/detail/:inventoryId', inventoryController.getVehicleDetail);

// module.exports = router;
