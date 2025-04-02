const pool = require("../database");

/* ******************************
 * Create a new message
 ******************************/
async function createMessage(from, to, subject, body) {
  const sql = `
    INSERT INTO message (message_subject, message_body, message_to, message_from)
    VALUES ($1, $2, $3, $4)
  `;
  return pool.query(sql, [subject, body, to, from]);
}

/* ******************************
 * Get inbox messages
 ******************************/
async function getInbox(account_id) {
  const sql = `
    SELECT m.*, a.account_firstname || ' ' || a.account_lastname AS sender_name
    FROM message m
    JOIN account a ON m.message_from = a.account_id
    WHERE m.message_to = $1 AND m.message_archived = FALSE
    ORDER BY m.message_created DESC
  `;
  const result = await pool.query(sql, [account_id]);
  return result.rows;
}

/* ******************************
 * Get a specific message
 ******************************/
async function getMessageById(message_id, account_id) {
  const sql = `
    SELECT m.*, a.account_firstname || ' ' || a.account_lastname AS sender_name
    FROM message m
    JOIN account a ON m.message_from = a.account_id
    WHERE m.message_id = $1 AND m.message_to = $2
  `;
  const result = await pool.query(sql, [message_id, account_id]);
  return result.rows[0];
}

/* ******************************
 * Mark a message as read
 ******************************/
async function markRead(message_id, account_id) {
  const sql = `
    UPDATE message SET message_read = TRUE
    WHERE message_id = $1 AND message_to = $2
  `;
  return pool.query(sql, [message_id, account_id]);
}

/* ******************************
 * Archive a message
 ******************************/
async function archiveMessage(message_id, account_id) {
  const sql = `
    UPDATE message SET message_archived = TRUE
    WHERE message_id = $1 AND message_to = $2
  `;
  return pool.query(sql, [message_id, account_id]);
}

/* ******************************
 * Delete a message
 ******************************/
async function deleteMessage(message_id, account_id) {
  const sql = `
    DELETE FROM message WHERE message_id = $1 AND message_to = $2
  `;
  return pool.query(sql, [message_id, account_id]);
}

/* ******************************
 * Get unread message count
 ******************************/
async function getUnreadCount(account_id) {
  const sql = `
    SELECT COUNT(*) FROM message
    WHERE message_to = $1 AND message_read = FALSE AND message_archived = FALSE
  `;
  const result = await pool.query(sql, [account_id]);
  return result.rows[0].count;
}

module.exports = {
  createMessage,
  getInbox,
  getMessageById,
  markRead,
  archiveMessage,
  deleteMessage,
  getUnreadCount
};
