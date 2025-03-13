const validation = {};

/* ***************************
 *  Validate Classification Name
 * ************************** */
validation.checkClassificationName = (req, res, next) => {
  const { classification_name } = req.body;

  if (!classification_name || !/^[A-Za-z0-9]+$/.test(classification_name)) {
    req.flash("notice", "Classification name must contain only letters and numbers (no spaces or special characters).");
    return res.redirect("/inv/add-classification");
  }

  next();
};

/* ***************************
 *  Validate Update Inventory Data
 * ************************** */
validation.checkUpdateData = (req, res, next) => {
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  } = req.body;

  let errors = [];

  if (!inv_make || inv_make.trim() === "") errors.push("Make is required.");
  if (!inv_model || inv_model.trim() === "") errors.push("Model is required.");
  if (!inv_year || isNaN(inv_year) || inv_year < 1900 || inv_year > new Date().getFullYear() + 1)
    errors.push("Year must be a valid number.");
  if (!inv_price || isNaN(inv_price) || inv_price < 0) errors.push("Price must be a positive number.");
  if (!inv_miles || isNaN(inv_miles) || inv_miles < 0) errors.push("Miles must be a positive number.");
  if (!inv_color || inv_color.trim() === "") errors.push("Color is required.");
  if (!classification_id || isNaN(classification_id)) errors.push("Classification is required.");

  if (errors.length > 0) {
    console.error("[checkUpdateData] Validation Errors:", errors);
    req.flash("notice", errors.join(" "));
    return res.redirect("back"); // Redirect back to edit page
  }

  next();
};

module.exports = validation;
