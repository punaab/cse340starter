const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const inventoryController = require('../controllers/baseController.js');

// // Route for viewing a specific vehicle
// router.get('/detail/:inventoryId', inventoryController.getVehicleDetail);

// module.exports = router;
