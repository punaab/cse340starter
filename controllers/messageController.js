const messageModel = require("../models/message-model");
const accountModel = require("../models/account-model"); 
const utilities = require("../utilities");

const messageController = {
  async inbox(req, res, next) {
    try {
      const nav = await utilities.getNav(req, res);
      const messages = await messageModel.getInbox(res.locals.account_id);
      res.render("messages/inbox", { title: "Inbox", messages, nav });
    } catch (err) {
      next(err);
    }
  },

// messageController.js
async compose(req, res, next) {
    try {
      console.log("Entering compose for account_id:", res.locals.account_id);
      const nav = await utilities.getNav(req, res);
      console.log("Nav fetched");
      const users = await accountModel.getAllUsersExcept(res.locals.account_id);
      console.log("Users fetched:", users);
      console.log("Rendering messages/compose");
      res.render("messages/compose", {
        title: "Compose Message",
        recipient: "",
        subject: "",
        body: "",
        error: "",
        users,
        nav,
      });
      console.log("Render called"); // Won’t log due to res.render ending response
    } catch (err) {
      console.error("Error in compose:", err);
      next(err);
    }
  },
  
  async send(req, res) {
    const { recipient, subject, body } = req.body;
    const from = res.locals.account_id;

    if (!recipient || !subject || !body) {
      const nav = await utilities.getNav(req, res);
      return res.render("messages/compose", {
        title: "Compose Message",
        recipient,
        subject,
        body,
        error: "All fields are required.",
        nav,
      });
    }

    try {
      await messageModel.createMessage(from, recipient, subject, body);
      req.flash("success", "Message sent!");
      res.redirect("/messages/inbox");
    } catch (err) {
      req.flash("error", "Failed to send message.");
      res.redirect("/messages/compose");
    }
  },

  async view(req, res, next) {
    try {
      const nav = await utilities.getNav(req, res);
      const message = await messageModel.getMessageById(req.params.id, res.locals.account_id);
      if (!message) {
        return res.status(403).send("Message not found or not authorized.");
      }

      await messageModel.markRead(req.params.id, res.locals.account_id);
      res.render("messages/view", { title: "View Message", message, nav });
    } catch (err) {
      next(err);
    }
  },

  async archive(req, res, next) {
    try {
      await messageModel.archiveMessage(req.params.id, res.locals.account_id);
      res.redirect("/messages/inbox");
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      await messageModel.deleteMessage(req.params.id, res.locals.account_id);
      res.redirect("/messages/inbox");
    } catch (err) {
      next(err);
    }
  }
};

module.exports = messageController;
