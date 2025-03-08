
/* **************************************
* Account Routes
* ************************************ */

//Needed Resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/") //took out index.js don't think it matters
const regValidate = require('../utilities/account-validation')


/* **************************************
* Deliver Login View
* ************************************ */
router.get("/login", utilities.handleErrors(accountController.buildLogin))


/* **************************************
* Deliver Registration View
* ************************************ */

router.get("/register", utilities.handleErrors(accountController.buildRegister))

/* **************************************
* Register Account
* ************************************ */

// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

module.exports = router;