const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const utilities = require("../utilities");

// Only allow logged in users
const checkLogin = utilities.checkLogin;

// Add these routes:
router.get("/inbox", checkLogin, messageController.inbox);
router.get("/compose", checkLogin, messageController.compose);
router.post("/send", checkLogin, messageController.send);
router.get("/view/:id", checkLogin, messageController.view);
router.post("/archive/:id", checkLogin, messageController.archive);
router.post("/delete/:id", checkLogin, messageController.delete);

module.exports = router;

