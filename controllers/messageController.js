const messageModel = require("../models/message-model");

const messageController = {
  async inbox(req, res, next) {
    try {
      const messages = await messageModel.getInbox(res.locals.account_id);
      res.render("messages/inbox", { title: "Inbox", messages });
    } catch (err) {
      next(err);
    }
  },

  compose(req, res) {
    res.render("messages/compose", { title: "Compose Message", recipient: "", subject: "", body: "", error: "" });
  },

  async send(req, res) {
    const { recipient, subject, body } = req.body;
    const from = res.locals.account_id;

    if (!recipient || !subject || !body) {
      return res.render("messages/compose", {
        title: "Compose Message",
        recipient,
        subject,
        body,
        error: "All fields are required.",
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
      const message = await messageModel.getMessageById(req.params.id, res.locals.account_id);
      if (!message) {
        return res.status(403).send("Message not found or not authorized.");
      }

      await messageModel.markRead(req.params.id, res.locals.account_id);
      res.render("messages/view", { title: "View Message", message });
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
  },
};

module.exports = messageController;
