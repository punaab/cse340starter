/* ****************************************
 *  Account Controller
 * *************************************** */
const utilities = require("../utilities");
const bcrypt = require("bcryptjs");
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.");
    return res.status(500).render("account/register", { title: "Registration", nav, errors: null });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
    res.status(201).render("account/login", { title: "Login", nav });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", { title: "Registration", nav, errors: null });
  }
}

async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      
      // Store session data (needed for `requireLogin`)
      req.session.loggedIn = true;
      req.session.account_id = accountData.account_id;
      req.session.account_firstname = accountData.account_firstname;
      req.session.account_type = accountData.account_type;

      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
      res.cookie("jwt", accessToken, { httpOnly: true, secure: process.env.NODE_ENV !== "development" });

      if (accountData.account_type === "Admin" || accountData.account_type === "Employee") {
        return res.redirect("/inv/");
      } else {
        return res.redirect("/account/");
      }
    } else {
      req.flash("notice", "Invalid credentials. Try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).send("Internal Server Error");
  }
}


/* ****************************************
 *  Deliver account management view
 * *************************************** */
async function buildManagement(req, res, next) {
  let nav = await utilities.getNav();
  
  // Ensure accountData is passed correctly
  let accountData = req.session.loggedIn ? {
    account_id: req.session.account_id,
    account_firstname: req.session.account_firstname,
    account_type: req.session.account_type,
  } : null;

  res.render("account/management", {
    title: "Account Management",
    nav,
    messages: req.flash(),
    errors: null,
    loggedIn: req.session.loggedIn || false,  // Pass loggedIn flag
    account_firstname: accountData ? accountData.account_firstname : "",
    accountData,  // ✅ Pass full account data
  });
}

/* ****************************************
 *  Deliver account update view
 * *************************************** */
async function buildAccountUpdate(req, res, next) {
  let nav = await utilities.getNav();
  const account_id = req.params.account_id;
  const accountData = await accountModel.getAccountById(account_id);

  if (!accountData) {
    req.flash("notice", "Account not found.");
    return res.redirect("/account/");
  }

  res.render("account/update", { title: "Update Account", nav, accountData, errors: null });
}

/* ****************************************
 *  Process Account Update
 * *************************************** */
async function updateAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_id, account_firstname, account_lastname, account_email } = req.body;

  const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);

  if (updateResult) {
    // ✅ Update session with new account data
    req.session.account_firstname = account_firstname;
    req.session.account_email = account_email;

    req.flash("notice", "Account updated successfully.");
    return res.redirect("/account/");
  } else {
    req.flash("notice", "Update failed. Try again.");
    res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      accountData: req.body,  // Keep user input in case of failure
    });
  }
}


/* ****************************************
 *  Process Password Update
 * *************************************** */
async function updatePassword(req, res) {
  let nav = await utilities.getNav();
  const { account_id, account_password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword);

    if (updateResult) {
      req.flash("notice", "Password updated successfully.");
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Password update failed.");
      return res.status(400).render("account/update", { title: "Update Account", nav, errors: null });
    }
  } catch (error) {
    console.error("[updatePassword] Error hashing password:", error);
    req.flash("notice", "Something went wrong.");
    return res.status(500).redirect("/account/update");
  }
}

/* ****************************************
 *  Process Logout (Clear JWT Cookie)
 * *************************************** */
async function logout(req, res) {
  // Set flash message BEFORE destroying session
  req.flash("notice", "You have logged out.");

  req.session.destroy((err) => {
    if (err) {
      console.error("Logout Error:", err);
    }
    res.clearCookie("jwt");
    res.clearCookie("sessionId"); // Clear session cookie
    return res.redirect("/");
  });
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildManagement, buildAccountUpdate, updateAccount, updatePassword, logout };
