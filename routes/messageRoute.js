const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const utilities = require("../utilities");

// Secure all message routes
const checkLogin = utilities.checkLogin;

router.get("/inbox", checkLogin, messageController.inbox);
router.get("/compose", checkLogin, messageController.compose);
router.post("/send", checkLogin, messageController.send);
router.get("/view/:id", checkLogin, messageController.view);
router.post("/archive/:id", checkLogin, messageController.archive);
router.post("/delete/:id", checkLogin, messageController.delete);

module.exports = router;
