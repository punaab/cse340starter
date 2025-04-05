const express = require("express");
const router = new express.Router();
const messageController = require("../controllers/messageController");
const utilities = require("../utilities");

// Secure all message routes
const checkLogin = utilities.checkLogin;

router.get("/inbox", checkLogin, messageController.inbox);
router.get("/compose", checkLogin, messageController.compose);
router.post("/send", checkLogin, messageController.send);
router.get("/view/:message_id", utilities.handleErrors(messageController.view));
router.post("/archive/:message_id", checkLogin, messageController.archive);
router.post("/delete/:message_id", checkLogin, messageController.delete);

module.exports = router;
