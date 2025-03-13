/* **************************************
 * Account Routes
 ************************************ */

// Needed Resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const regValidate = require("../utilities/account-validation"); 

/* **************************************
 * Deliver Login View
 ************************************ */
router.get("/login", utilities.handleErrors(accountController.buildLogin));

/* **************************************
 * Deliver Registration View
 ************************************ */
router.get("/register", utilities.handleErrors(accountController.buildRegister));

/* **************************************
 * Build Management View
 ************************************ */
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement));

/* **************************************
 * Register Account
 ************************************ */
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

/* **************************************
 * Process the login request
 ************************************ */
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

/* **************************************
 * Process Account Update (First name, Last name, Email)
 ************************************ */
router.post(
  "/update",
  utilities.checkLogin,
  regValidate.updateAccountRules(), 
  regValidate.checkUpdateData, 
  utilities.handleErrors(accountController.updateAccount)
);

/* **************************************
 * Process Password Update
 ************************************ */
router.post(
  "/update-password",
  utilities.checkLogin,
  regValidate.passwordUpdateRules(),
  regValidate.checkPasswordUpdate,
  utilities.handleErrors(accountController.updatePassword)
);

/* **************************************
 * Logout Route (Clears JWT Cookie)
 ************************************ */
router.get("/logout", utilities.handleErrors(accountController.logout));

module.exports = router;
