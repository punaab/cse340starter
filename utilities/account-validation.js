const accountModel = require("../models/account-model");
const utilities = require("../utilities");
const { body, validationResult } = require("express-validator");

const validate = {};

/* **********************************
 * Registration Data Validation Rules
 ********************************* */
validate.registationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email);
        if (emailExists) {
          throw new Error("Email already exists. Please log in or use a different email.");
        }
      }),

    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password must be at least 12 characters long, include an uppercase letter, a number, and a symbol."),
  ];
};

/* ******************************
 * Check registration data
 ***************************** */
validate.checkRegData = async (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("account/register", {
      errors: errors.array(),
      title: "Registration",
      nav,
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
    });
  }
  next();
};

/* **********************************
 * Login Data Validation Rules
 ********************************* */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    body("account_password")
      .trim()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a password."),
  ];
};

/* ******************************
 * Check login data
 ***************************** */
validate.checkLoginData = async (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("account/login", {
      errors: errors.array(),
      title: "Login",
      nav,
      account_email: req.body.account_email,
    });
  }
  next();
};

/* ******************************
 * Update Account Validation Rules
 ***************************** */
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const existingUser = await accountModel.getAccountByEmail(account_email);
        if (existingUser && existingUser.account_id !== req.body.account_id) {
          throw new Error("This email is already in use by another account.");
        }
      }),
  ];
};

/* ******************************
 * Check Updated Account Data
 ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      accountData: req.body, // Keeps form values sticky
    });
  }
  next();
};

/* ******************************
 * Password Update Validation Rules
 ***************************** */
validate.passwordUpdateRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password must be at least 12 characters long and include uppercase, lowercase, numbers, and symbols."),
  ];
};

/* ******************************
 * Check Password Update Data
 ***************************** */
validate.checkPasswordUpdate = async (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("account/update", {
      title: "Update Password",
      nav,
      errors: errors.array(),
      accountData: req.body, // Keeps form values sticky
    });
  }
  next();
};

/* ******************************
 * Export the Validation Rules
 ***************************** */
module.exports = {
  registationRules: validate.registationRules,
  checkRegData: validate.checkRegData,
  loginRules: validate.loginRules,
  checkLoginData: validate.checkLoginData,
  updateAccountRules: validate.updateAccountRules,
  checkUpdateData: validate.checkUpdateData,
  passwordUpdateRules: validate.passwordUpdateRules,
  checkPasswordUpdate: validate.checkPasswordUpdate,
};

