
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

// Process the login attempt
router.post(
    "/login",
    (req, res) => {
      res.status(200).send('login process')
    }
  )  

module.exports = router;