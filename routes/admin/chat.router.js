const express = require("express");
const {
  Auth,
  checkUserRole,
  checkAdminRole,
  checkModeratorRole,
} = require("../../middleware/userAuth");
const router = express.Router();
const ChatController = require("../../controllers/ChatController");
const MessageController = require("../../controllers/MessageController");

const chat = new ChatController();
const message = new MessageController();
router.get("/get-all-chat", Auth, checkAdminRole, (req, res) => {
  chat.getAllChatAdmin(req, res);
});
router.get("/get-info-chat/:chatId", Auth, checkAdminRole, (req, res) => {
  chat.getDetailChatAdmin(req, res);
});
router.get("/get-all-message", Auth, checkAdminRole, (req, res) => {
  message.getAllMessagesAdmin(req, res);
});

module.exports = router;
