const express = require("express");
const {
  Auth,
  checkUserRole,
  checkAdminRole,
  checkModeratorRole,
} = require("../middleware/userAuth.js");
const MessageController = require("../controllers/MessageController");
const router = express.Router();

// router.get('/auth/register', async (req, res) => {
//   await UserController.register(req, res);
// });
let message = new MessageController();

router.post("/send-message", Auth, checkUserRole, async (req, res) => {
  await message.sendMessage(req, res);
});

router.get("/get-messages/:chatId", Auth, checkUserRole, async (req, res) => {
  await message.getMessages(req, res);
});

module.exports = router;
