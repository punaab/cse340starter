const pool = require("../database/index")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
      const sql = `
          INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) 
          VALUES ($1, $2, $3, $4, 'Client') RETURNING account_id`;
      
      const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
      return result.rowCount > 0; // ✅ Returns true if successful
  } catch (error) {
      console.error("[registerAccount] Error:", error);
      return false;
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
      const sql = "SELECT account_id FROM account WHERE account_email = $1";
      const result = await pool.query(sql, [account_email]);
      return result.rowCount > 0; // ✅ Returns true if email exists
  } catch (error) {
      console.error("[checkExistingEmail] Error:", error);
      return false;
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail(account_email) {
  try {
      const sql = `
          SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password 
          FROM account WHERE account_email = $1`;
      
      const result = await pool.query(sql, [account_email]);
      return result.rows.length > 0 ? result.rows[0] : null; // ✅ Return `null` if no match
  } catch (error) {
      console.error("[getAccountByEmail] Error fetching account data:", error);
      return null;
  }
}

/* *****************************
* Get account by account_id
* ***************************** */
async function getAccountById(account_id) {
  try {
      const sql = `
          SELECT account_id, account_firstname, account_lastname, account_email, account_type 
          FROM account WHERE account_id = $1`;
      
      const result = await pool.query(sql, [account_id]);
      return result.rows.length > 0 ? result.rows[0] : null; // ✅ Return `null` if no match
  } catch (error) {
      console.error("[getAccountById] Error fetching account data:", error);
      return null;
  }
}

/* *****************************
* Update account information
* ***************************** */
async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
  try {
      const sql = `
          UPDATE account 
          SET account_firstname = $1, account_lastname = $2, account_email = $3 
          WHERE account_id = $4 
          RETURNING account_id`;
      
      const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id]);
      return result.rowCount > 0; // ✅ Return true if update was successful
  } catch (error) {
      console.error("[updateAccount] Error updating account:", error);
      return false;
  }
}

/* *****************************
* Update account password
* ***************************** */
async function updatePassword(account_id, hashedPassword) {
  try {
      const sql = `UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING account_id`;
      const result = await pool.query(sql, [hashedPassword, account_id]);
      return result.rowCount > 0; // ✅ Return true if update was successful
  } catch (error) {
      console.error("[updatePassword] Error updating password:", error);
      return false;
  }
}

module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, getAccountById, updateAccount, updatePassword };
