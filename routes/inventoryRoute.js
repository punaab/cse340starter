const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const validation = require("../middleware/validation");

// Route for Viewing Inventory by Classification ID
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route for Viewing Inventory Item Details
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId));

// Management View Route
router.get("/", utilities.handleErrors(invController.buildManagement));

// Route for Adding a New Classification
router.get("/add-classification", utilities.handleErrors(invController.buildNewClassification));

// Route to Get Inventory as JSON
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryByClassificationId));

// Route to Process Adding a Classification
router.post(
  "/add-classification",
  validation.checkClassificationName,
  utilities.handleErrors(invController.addClassification)
);

// Route for Adding New Inventory
router.get("/new-inventory", utilities.handleErrors(invController.buildNewInventory));
router.post("/new-inventory", utilities.handleErrors(invController.addNewInventory));

// Route to Display Edit Inventory View
router.get("/edit/:inventory_id", utilities.handleErrors(invController.buildEditInventoryView));

// Route to Process Updating Inventory
router.post(
  "/update",
  validation.checkUpdateData, // ✅ Ensure validation middleware exists
  utilities.handleErrors(invController.updateInventory)
);

// Route to Show Delete Confirmation Page
router.get("/delete/:inventory_id", utilities.handleErrors(invController.buildDeleteConfirmationView));

// Route to Process Deletion
router.get("/delete-item/:inventory_id", utilities.handleErrors(invController.deleteInventoryItem));

module.exports = router;
