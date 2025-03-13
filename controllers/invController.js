const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

// ***********************
// Display Inventory by Classification
// ***********************
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    console.log(`[DEBUG] Fetching inventory for classification ID: ${classification_id}`);

    const data = await invModel.getInventoryByClassificationId(classification_id);
    console.log(`[DEBUG] Vehicles found for classification ${classification_id}:`, data);

    let nav = await utilities.getNav();

    if (!data || data.length === 0) {
      console.warn(`[WARNING] No vehicles found for classification ${classification_id}`);
      req.flash("notice", "No vehicles found for this classification.");
      return res.redirect("/inv/");
    }

    const grid = await utilities.buildClassificationGrid(data);
    res.render("inventory/classification", {
      title: `${data[0].classification_name} Vehicles`,
      nav,
      grid,
    });
  } catch (error) {
    console.error("[buildByClassificationId] Error:", error);
    next(error);
  }
};

// ***********************
// Display Single Inventory Item
// ***********************
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = req.params.inventoryId;
    const data = await invModel.getSingleByInventoryID(inv_id);

    let nav = await utilities.getNav();

    if (!data) {
      req.flash("notice", "Vehicle details not found.");
      return res.redirect("/inv/");
    }

    res.render("inventory/single", {
      title: `${data.inv_make} ${data.inv_model}`,
      nav,
      vehicle: data,
    });
  } catch (error) {
    console.error("[buildByInventoryId] Error:", error);
    next(error);
  }
};

// ***********************
// Inventory Management Page
// ***********************
invCont.buildManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    console.log("[buildManagement] classificationList:", classificationList); // Add this
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      flash: req.flash("notice"),
      classificationList,
    });
  } catch (error) {
    console.error("[buildManagement] Error:", error);
    next(error);
  }
};

// ***********************
// Get Inventory by Classification ID (for AJAX)
// ***********************
invCont.getInventoryByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classification_id; // Updated from classificationId
    console.log(`[getInventoryByClassificationId] Fetching for classification_id: ${classification_id}`);
    const data = await invModel.getInventoryByClassificationId(classification_id);
    console.log(`[getInventoryByClassificationId] Data:`, data);
    if (data && data.length > 0) {
      res.json(data);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error("[getInventoryByClassificationId] Error:", error);
    next(error);
  }
};

// ***********************
// Add New Classification Page
// ***********************
invCont.buildNewClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      flash: req.flash("notice"),
      errors: null,
    });
  } catch (error) {
    console.error("[buildNewClassification] Error:", error);
    next(error);
  }
};

// ***********************
// Process Adding a Classification
// ***********************
invCont.addClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const { classification_name } = req.body;
    let errors = [];

    if (!classification_name || !/^[A-Za-z0-9]+$/.test(classification_name.trim())) {
      errors.push("Classification name must contain only letters and numbers (no spaces or special characters).");
    }

    if (errors.length > 0) {
      req.flash("error", errors[0]);
      return res.status(400).render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        flash: req.flash(),
        errors,
      });
    }

    const result = await invModel.addClassification(classification_name);
    if (result.success) {
      req.flash("success", "New classification added successfully.");
      return res.redirect("/inv/");
    } else {
      req.flash("error", result.message || "Error inserting classification.");
      return res.redirect("/inventory/add-classification");
    }
  } catch (error) {
    console.error("[addClassification] Error:", error);
    req.flash("error", "Server error. Please try again.");
    next(error);
  }
};

// ***********************
// Add New Inventory Page
// ***********************
invCont.buildNewInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList();

    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      flash: req.flash("notice"),
      errors: null,
      inv_make: "",
      inv_model: "",
      inv_description: "",
      inv_year: "",
      inv_price: "",
      inv_miles: "",
      inv_color: "",
      inv_image: "/images/vehicles/no-image.png",
      inv_thumbnail: "/images/vehicles/no-image-tn.png",
    });
  } catch (error) {
    console.error("[buildNewInventory] Error:", error);
    next(error);
  }
};

// ***********************
// Process Adding a New Inventory Item
// ***********************
invCont.addNewInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList();
    const {
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      inv_miles,
      inv_color,
      inv_image,
      inv_thumbnail,
      classification_id,
      inv_description,
    } = req.body;

    let errors = [];

    if (
      !inv_make ||
      !inv_model ||
      !inv_year ||
      !inv_price ||
      !inv_miles ||
      !inv_color ||
      !classification_id ||
      !inv_description
    ) {
      errors.push("All fields, including description, are required.");
    }

    if (errors.length > 0) {
      return res.status(400).render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationList,
        flash: [],
        errors,
        inv_make,
        inv_model,
        inv_description,
        inv_year,
        inv_price,
        inv_miles,
        inv_color,
        inv_image,
        inv_thumbnail,
      });
    }

    const result = await invModel.addInventory(
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      inv_miles,
      inv_color,
      inv_image,
      inv_thumbnail,
      classification_id,
      inv_description
    );

    if (result.success) {
      req.flash("notice", "New inventory item added successfully.");
      return res.redirect("/inv/");
    } else {
      errors.push(result.message || "Error adding inventory item.");
      return res.status(500).render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationList,
        flash: [],
        errors,
        inv_make,
        inv_model,
        inv_year,
        inv_price,
        inv_miles,
        inv_color,
        inv_image,
        inv_thumbnail,
        inv_description,
      });
    }
  } catch (error) {
    console.error("[addNewInventory] Error:", error);
    next(error);
  }
};

// Display Edit Inventory View
invCont.buildEditInventoryView = async function (req, res, next) {
  try {
    const inventory_id = req.params.inventory_id;
    console.log(`[buildEditInventoryView] Fetching inventory_id: ${inventory_id}`);
    const data = await invModel.getSingleByInventoryID(inventory_id);
    if (!data) {
      req.flash("notice", "Inventory item not found.");
      return res.redirect("/inv/");
    }
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList(data.classification_id); // Pre-select current classification
    res.render("inventory/edit-inventory", {
      title: `Edit ${data.inv_make} ${data.inv_model}`,
      nav,
      classificationList,
      flash: req.flash("notice"),
      errors: null,
      inv_id: data.inv_id,
      inv_make: data.inv_make,
      inv_model: data.inv_model,
      inv_year: data.inv_year,
      inv_price: data.inv_price,
      inv_miles: data.inv_miles,
      inv_color: data.inv_color,
      inv_image: data.inv_image,
      inv_thumbnail: data.inv_thumbnail,
      classification_id: data.classification_id,
      inv_description: data.inv_description,
    });
  } catch (error) {
    console.error("[buildEditInventoryView] Error:", error);
    next(error);
  }
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body;

    console.log(`[updateInventory] Processing update for ID: ${inv_id}`);

    const updateResult = await invModel.updateInventory(
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    );

    if (updateResult) {
      req.flash("notice", `The ${inv_make} ${inv_model} was successfully updated.`);
      res.redirect("/inv/");
    } else {
      req.flash("notice", "Update failed.");
      res.status(501).render("inventory/edit-inventory", {
        title: `Edit ${inv_make} ${inv_model}`,
        nav,
        classificationSelect: await utilities.buildClassificationList(classification_id),
        errors: null,
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
      });
    }
  } catch (error) {
    console.error("[updateInventory] Error:", error);
    next(error);
  }
};

/* ***************************
 *  Build Delete Confirmation View
 * ************************** */
invCont.buildDeleteConfirmationView = async function (req, res, next) {
  try {
    const inventory_id = req.params.inventory_id;
    console.log(`[buildDeleteConfirmationView] Fetching inventory_id: ${inventory_id}`);
    
    const data = await invModel.getSingleByInventoryID(inventory_id);
    if (!data) {
      req.flash("notice", "Inventory item not found.");
      return res.redirect("/inv/");
    }

    let nav = await utilities.getNav();
    res.render("inventory/delete-confirm", {
      title: `Delete ${data.inv_make} ${data.inv_model}`,
      nav,
      flash: req.flash("notice"),
      inv_id: data.inv_id,
      inv_make: data.inv_make,
      inv_model: data.inv_model,
      inv_year: data.inv_year,
      inv_price: data.inv_price
    });
  } catch (error) {
    console.error("[buildDeleteConfirmationView] Error:", error);
    next(error);
  }
};

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteInventoryItem = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inventory_id);
    console.log(`[deleteInventoryItem] Deleting item ID: ${inv_id}`);

    const deleteResult = await invModel.deleteInventoryItem(inv_id);

    if (deleteResult.rowCount > 0) {
      req.flash("notice", "Inventory item deleted successfully.");
      return res.redirect("/inv/");
    } else {
      req.flash("notice", "Delete failed. Please try again.");
      return res.redirect(`/inv/delete/${inv_id}`);
    }
  } catch (error) {
    console.error("[deleteInventoryItem] Error:", error);
    next(error);
  }
};



module.exports = invCont;

