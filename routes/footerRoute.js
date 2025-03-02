// const Util = require("../utilities")

const express = require("express")
const router = new express.Router()

router.get("../../views/partials/footer", utilities.handleErrors())

// module.exports = router;