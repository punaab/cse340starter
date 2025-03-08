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
// Display Single Inventory Item
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = req.params.inventoryId; // Get vehicle ID from URL
    const data = await invModel.getSingleByInventoryID(inv_id); // Fetch vehicle details

    let nav = await utilities.getNav(); // Get Navigation

    if (!data) {
      req.flash("notice", "Vehicle details not found.");
      return res.redirect("/inv/");
    }

    res.render("inventory/single", {
      title: `${data.inv_make} ${data.inv_model}`, // Page Title
      nav,
      vehicle: data, // Send vehicle data to the view, including inv_image
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
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      flash: req.flash("notice"),
    });
  } catch (error) {
    console.error("[buildManagement] Error:", error);
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

    // ✅ Validate input: No spaces, special characters, and should be unique
    if (!classification_name || !/^[A-Za-z0-9]+$/.test(classification_name.trim())) {
      errors.push("Classification name must contain only letters and numbers (no spaces or special characters).");
    }

    if (errors.length > 0) {
      req.flash("error", errors[0]); // Flash first error message
      return res.status(400).render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        flash: req.flash(), // Ensure flash messages are properly retrieved
        errors,
      });
    }

    // Insert into database
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
      inv_make, inv_model, inv_year, inv_price, inv_miles, 
      inv_color, inv_image, inv_thumbnail, classification_id, inv_description
    } = req.body;
    
    let errors = [];

    // ✅ Validate required fields
    if (!inv_make || !inv_model || !inv_year || !inv_price || 
        !inv_miles || !inv_color || !classification_id || !inv_description) {
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

    // ✅ Insert into database
    const result = await invModel.addInventory(
      inv_make, inv_model, inv_year, inv_price, inv_miles, 
      inv_color, inv_image, inv_thumbnail, classification_id, inv_description
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
        inv_description
      });
    }
  } catch (error) {
    console.error("[addNewInventory] Error:", error);
    next(error);
  }
};





module.exports = invCont;


