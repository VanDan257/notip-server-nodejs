const express = require("express");
const { Auth, checkAdminRole } = require("../../middleware/userAuth");
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

router.post("/remove-user-in-group", Auth, checkAdminRole, async (req, res) => {
  await chat.removeMemberInGroup(req, res);
});

module.exports = router;
