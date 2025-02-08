const express = require("express");
const router = new express.Router(); 
const invController = require("../controllers/invController");
// const inventoryController = require('../controllers/baseController.js');

// // Route for viewing a specific vehicle
router.get("/type/:classificationId", invController.buildByClassificationId);

module.exports = router;
// Route to build inventory by classification view


// const express = require('express');
// const router = express.Router();
// const inventoryController = require('../controllers/baseController.js');

// // Route for viewing a specific vehicle
// router.get('/detail/:inventoryId', inventoryController.getVehicleDetail);

// module.exports = router;
