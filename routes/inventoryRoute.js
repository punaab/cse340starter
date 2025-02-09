const express = require("express");
const router = new express.Router(); 
const invController = require("../controllers/invController");
const utilities = require("../utilities/index")
// const invController = require('../controllers/baseController.js');

// // Route for viewing a specific vehicle
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByClassificationId));

module.exports = router;
// Route to build inventory by classification view


// const express = require('express');
// const router = express.Router();
// const inventoryController = require('../controllers/baseController.js');

// // Route for viewing a specific vehicle
// router.get('/detail/:inventoryId', inventoryController.getVehicleDetail);

// module.exports = router;
