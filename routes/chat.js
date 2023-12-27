const express = require("express");
const {
  Auth,
  checkUserRole,
  checkAdminRole,
  checkModeratorRole,
} = require("../middleware/userAuth.js");
const router = express.Router();
const ChatController = require("../controllers/ChatController.js");

let chat = new ChatController();

router.post("/access-chat", Auth, async (req, res) => {
  console.log(req.body);
  await chat.accessChatUser(req, res);
});
router.get("/get-all-chat", Auth, checkUserRole, async (req, res) => {
  await chat.fetchAllChats(req, res);
});
router.get("/search-chat/:keySearch", Auth, async (req, res) => {
  await chat.searchAllGroup(req, res);
});
router.get("/get-info-chat/:chatId", Auth, checkUserRole, async (req, res) => {
  await chat.getInfo(req, res);
});
router.post("/create-chat", Auth, checkUserRole, async (req, res) => {
  await chat.creatGroup(req, res);
});
router.post("/update-photo-chat", Auth, checkUserRole, async (req, res) => {
  await chat.updateChatPhoto(req, res);
});
router.post("/group/rename", Auth, async (req, res) => {
  await chat.renameGroup(req, res);
});
router.post("/groupAdd", Auth, checkUserRole, async (req, res) => {
  await chat.addToGroup(req, res);
});
router.post("/groupRemove", Auth, checkUserRole, async (req, res) => {
  await chat.removeFromGroup(req, res);
});
// router.delete('/removeuser', Auth);

module.exports = router;
