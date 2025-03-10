const express = require("express");
const messageRoute = express.Router();
const {
  sendMessage,
  getMessages,
  getMessagesbyUserId,
} = require("../controllers/messageController");

// Message routes
messageRoute.post("/send", sendMessage);
messageRoute.get("/messages", getMessages);
messageRoute.get("/messages/:userId", getMessagesbyUserId);

module.exports = {messageRoute};
