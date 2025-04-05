const messageModel = require("../models/message-model");
const utilities = require("../utilities");

const messageController = {
  async inbox(req, res, next) {
    try {
      const nav = await utilities.getNav(req, res);
      const inboxMessages = await messageModel.getInbox(res.locals.account_id);
      const renderData = {
        title: "Inbox",
        nav,
        inboxMessages,
        messages: res.locals.messages || {},
        loggedIn: res.locals.loggedIn,
        unreadMessageCount: res.locals.unreadMessageCount,
      };
      console.log("Inbox - Data passed:", renderData);
      const bodyContent = await new Promise((resolve, reject) => {
        req.app.render("messages/inbox", renderData, (err, html) => {
          if (err) reject(err);
          else resolve(html);
        });
      });
      const finalHtml = await new Promise((resolve, reject) => {
        req.app.render("layouts/layout", { ...renderData, body: bodyContent }, (err, html) => {
          if (err) reject(err);
          else resolve(html);
        });
      });
      res.send(finalHtml);
    } catch (err) {
      console.error("Inbox - Error:", err);
      next(err);
    }
  },

  async compose(req, res, next) {
    try {
      const nav = await utilities.getNav(req, res);
      const users = await messageModel.getAllUsersExcept(res.locals.account_id);
      const renderData = {
        title: "Compose Message",
        nav,
        users,
        subject: "",
        body: "",
        messages: res.locals.messages || {},
        loggedIn: res.locals.loggedIn,
        unreadMessageCount: res.locals.unreadMessageCount,
      };
      console.log("Compose - Data passed:", renderData);
      const bodyContent = await new Promise((resolve, reject) => {
        req.app.render("messages/compose", renderData, (err, html) => {
          if (err) reject(err);
          else resolve(html);
        });
      });
      const finalHtml = await new Promise((resolve, reject) => {
        req.app.render("layouts/layout", { ...renderData, body: bodyContent }, (err, html) => {
          if (err) reject(err);
          else resolve(html);
        });
      });
      res.send(finalHtml);
    } catch (err) {
      console.error("Compose - Error:", err);
      req.flash("error", "An error occurred while loading the compose page.");
      res.redirect("/messages/inbox");
    }
  },

  async send(req, res, next) {
    const { recipient, subject, body } = req.body;
    const from = res.locals.account_id;
    try {
      await messageModel.createMessage(from, recipient, subject, body);
      req.flash("success", "Message sent successfully!");
      res.redirect("/messages/inbox");
    } catch (err) {
      console.error("Send - Error:", err);
      req.flash("error", "Failed to send message.");
      res.redirect("/messages/compose");
    }
  },

  async view(req, res, next) {
    try {
      const messageIdRaw = req.params.message_id;
      console.log(`View - Full req.params:`, req.params);
      console.log(`View - Raw message_id from params: "${messageIdRaw}"`);
      if (!messageIdRaw || isNaN(parseInt(messageIdRaw, 10))) {
        console.log(`View - Invalid message ID: ${messageIdRaw}`);
        req.flash("error", "Invalid message ID.");
        return res.redirect("/messages/inbox");
      }
      const messageId = parseInt(messageIdRaw, 10);
      const accountId = res.locals.account_id;
      console.log(`View - Attempting to fetch message ID: ${messageId} for account ID: ${accountId}`);

      const message = await messageModel.getMessageById(messageId, accountId);
      if (!message) {
        console.log(`View - Message not found or access denied for ID: ${messageId}`);
        req.flash("error", "Message not found or you don’t have access to it.");
        return res.redirect("/messages/inbox");
      }

      // Removed: Automatic mark as read
      // console.log(`View - Marking message ID: ${messageId} as read`);
      // await messageModel.updateReadStatus(messageId, accountId, true);

      // Fetch navigation
      const nav = await utilities.getNav();

      console.log(`View - Data passed:`, {
        title: message.message_subject,
        nav,
        message_subject: message.message_subject,
        sender_name: message.sender_name,
        message_created: message.message_created,
        message_read: message.message_read,
        message_body: message.message_body,
        message_id: message.message_id,
        messages: res.locals.messages,
        loggedIn: res.locals.loggedIn,
        unreadMessageCount: res.locals.unreadMessageCount
      });

      res.render("messages/view", {
        title: message.message_subject,
        nav,
        message_subject: message.message_subject,
        sender_name: message.sender_name,
        message_created: message.message_created,
        message_read: message.message_read,
        message_body: message.message_body,
        message_id: message.message_id,
        messages: res.locals.messages,
        loggedIn: res.locals.loggedIn,
        unreadMessageCount: res.locals.unreadMessageCount
      });
    } catch (err) {
      console.error("View - Error:", err);
      req.flash("error", "Failed to load message.");
      res.redirect("/messages/inbox");
    }
  },

  async archive(req, res, next) {
    try {
      console.log("Archive - Full req.params:", req.params);
      const messageIdRaw = req.params.message_id;
      console.log(`Archive - Raw message_id from params: "${messageIdRaw}"`);
      if (!messageIdRaw || isNaN(parseInt(messageIdRaw, 10))) {
        console.log(`Archive - Invalid message ID: ${messageIdRaw}`);
        req.flash("error", "Invalid message ID.");
        return res.redirect("/messages/inbox");
      }
      const messageId = parseInt(messageIdRaw, 10);
      const accountId = res.locals.account_id;
      console.log(`Archive - Archiving message ID: ${messageId} for account ID: ${accountId}`);
      const result = await messageModel.archiveMessage(messageId, accountId);
      if (result.rowCount === 0) {
        console.log(`Archive - No rows affected for message ID: ${messageId}`);
        req.flash("error", "Message not found or you don’t have access to archive it.");
      } else {
        console.log(`Archive - Successfully archived message ID: ${messageId}`);
        req.flash("success", "Message archived successfully.");
      }
      res.redirect("/messages/inbox");
    } catch (err) {
      console.error("Archive - Error:", err);
      req.flash("error", "Failed to archive message.");
      res.redirect("/messages/inbox");
    }
  },

  async delete(req, res, next) {
    try {
      const messageId = parseInt(req.params.message_id, 10);
      const accountId = res.locals.account_id;
      console.log(`Delete - Deleting message ID: ${messageId} for account ID: ${accountId}`);
      const result = await messageModel.deleteMessage(messageId, accountId);
      if (result.rowCount === 0) {
        console.log(`Delete - No rows affected for message ID: ${messageId}`);
        req.flash("error", "Message not found or you don’t have access to delete it.");
      } else {
        console.log(`Delete - Successfully deleted message ID: ${messageId}`);
        req.flash("success", "Message deleted successfully.");
      }
      res.redirect("/messages/inbox");
    } catch (err) {
      console.error("Delete - Error:", err);
      req.flash("error", "Failed to delete message.");
      res.redirect("/messages/inbox");
    }
  },

  async toggleRead(req, res, next) {
    try {
      const messageIdRaw = req.params.message_id;
      console.log(`ToggleRead - Raw message_id from params: "${messageIdRaw}"`);
      if (!messageIdRaw || isNaN(parseInt(messageIdRaw, 10))) {
        console.log(`ToggleRead - Invalid message ID: ${messageIdRaw}`);
        req.flash("error", "Invalid message ID.");
        return res.redirect(`/messages/view/${messageIdRaw}`);
      }
      const messageId = parseInt(messageIdRaw, 10);
      const accountId = res.locals.account_id;
      console.log(`ToggleRead - Toggling read status for message ID: ${messageId} for account ID: ${accountId}`);

      // Get current message status
      const message = await messageModel.getMessageById(messageId, accountId);
      if (!message) {
        console.log(`ToggleRead - Message not found or access denied for ID: ${messageId}`);
        req.flash("error", "Message not found or you don’t have access to it.");
        return res.redirect(`/messages/view/${messageId}`);
      }

      // Toggle the read status
      const newStatus = !message.message_read; // Flip current status
      const result = await messageModel.updateReadStatus(messageId, accountId, newStatus);
      if (result.rowCount === 0) {
        console.log(`ToggleRead - No rows affected for message ID: ${messageId}`);
        req.flash("error", "Failed to update message status.");
      } else {
        console.log(`ToggleRead - Successfully updated message ID: ${messageId} to read: ${newStatus}`);
        req.flash("success", `Message is now marked as ${newStatus ? "read" : "unread"}.`);
      }
      res.redirect(`/messages/view/${messageId}`);
    } catch (err) {
      console.error("ToggleRead - Error:", err);
      req.flash("error", "Failed to update message status.");
      res.redirect(`/messages/view/${req.params.message_id}`);
    }
  }
};

module.exports = messageController;