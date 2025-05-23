const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  try {
    console.log("[getClassifications] Querying database...");
    const result = await pool.query("SELECT classification_id, classification_name FROM public.classification ORDER BY classification_name");
    console.log("[getClassifications] Raw DB Result:", result);
    if (!result || !result.rows || result.rows.length === 0) {
      console.warn("[getClassifications] No classifications found.");
      return [];
    }
    console.log("[getClassifications] Data Retrieved:", result.rows);
    return result.rows;
  } catch (error) {
    console.error("[getClassifications] Database error:", error);
    return [];
  }
}


/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    console.log(`[getInventoryByClassificationId] Querying for: ${classification_id}`);
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    );
    console.log(`[getInventoryByClassificationId] Result:`, data.rows);
    return data.rows;
  } catch (error) {
    console.error("[getInventoryByClassificationId] Error:", error);
    return [];
  }
}

/* ***************************
 *  Get inventory item details by inv_id
 * ************************** */
async function getSingleByInventoryID(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`, // Fetch full vehicle details
      [inv_id]
    );
    return data.rows[0]; // ✅ Returns single vehicle object
  } catch (error) {
    console.error("[getSingleByInventoryID] Error:", error);
    return null;
  }
}


/* ***************************
 *  Add new classification
 *  Prevents duplicate classification names
 * ************************** */
async function addClassification(classification_name) {
  try {
    const checkSql = `SELECT classification_id FROM public.classification WHERE classification_name = $1`;
    const checkResult = await pool.query(checkSql, [classification_name]);

    if (checkResult.rows.length > 0) {
      console.warn(`[addClassification] Classification '${classification_name}' already exists.`);
      return { success: false, message: "Classification already exists." };
    }

    const insertSql = `INSERT INTO public.classification (classification_name)
                       VALUES ($1) RETURNING classification_id`;
    const insertResult = await pool.query(insertSql, [classification_name]);

    return { success: true, classification_id: insertResult.rows[0].classification_id };
  } catch (error) {
    console.error("[addClassification] Error:", error);
    return { success: false, message: "Database error while adding classification." };
  }
}

/* ***************************
 *  Add New Inventory to Database
 * ************************** */
async function addInventory(inv_make, inv_model, inv_year, inv_price, inv_miles, 
  inv_color, inv_image, inv_thumbnail, classification_id, inv_description) {
  
  try {
    const insertSql = `
      INSERT INTO public.inventory 
      (inv_make, inv_model, inv_year, inv_price, inv_miles, inv_color, 
       inv_image, inv_thumbnail, classification_id, inv_description) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING inv_id`;

    const result = await pool.query(insertSql, [
      inv_make, inv_model, inv_year, inv_price, inv_miles, inv_color, 
      inv_image, inv_thumbnail, classification_id, inv_description
    ]);

    return { success: true, inv_id: result.rows[0].inv_id };
  } catch (error) {
    console.error("[addInventory] Database Error:", error);
    return { success: false, message: "Database error while adding inventory item." };
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    console.log(`[updateInventory] Updating item ID: ${inv_id}`);

    const sql = `
      UPDATE public.inventory 
      SET inv_make = $1, inv_model = $2, inv_description = $3, 
          inv_image = $4, inv_thumbnail = $5, inv_price = $6, 
          inv_year = $7, inv_miles = $8, inv_color = $9, 
          classification_id = $10 
      WHERE inv_id = $11
      RETURNING *`;

    const result = await pool.query(sql, [
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
      inv_id
    ]);

    if (result.rows.length > 0) {
      console.log(`[updateInventory] Successfully updated item ID: ${inv_id}`);
      return result.rows[0]; // ✅ Return updated item
    } else {
      console.warn(`[updateInventory] No item found with ID: ${inv_id}`);
      return null; // ❌ No item was updated
    }
  } catch (error) {
    console.error("[updateInventory] Database Error:", error);
    return null;
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM public.inventory WHERE inv_id = $1';
    const data = await pool.query(sql, [inv_id]);
    return data;
  } catch (error) {
    console.error("[deleteInventoryItem] Database Error:", error);
    throw new Error("Delete Inventory Error");
  }
}




module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getSingleByInventoryID,
  addClassification,
  addInventory, 
  updateInventory,
  deleteInventoryItem
};

