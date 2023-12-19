const express = require("express");
const Auth = require("../middleware/userAuth.js");
const router = express.Router();
const ChatController = require("../controllers/ChatController.js");

let chat = new ChatController();

router.post("/", async (req, res) => {
  await chat.accessChats(req, res);
});
router.get("/get-all-chat", async (req, res) => {
  await chat.fetchAllChats(req, res);
});
router.get("/search-chat/:keySearch", async (req, res) => {
  await chat.searchAllGroup(req, res);
});
router.get("/get-info-chat/:chatId", async (req, res) => {
  await chat.getInfo(req, res);
});
router.post("/create-chat", async (req, res) => {
  await chat.creatGroup(req, res);
});
router.post("/update-photo-chat", async (req, res) => {
  await chat.updateChatPhoto(req, res);
});
router.post("/group/rename", async (req, res) => {
  await chat.renameGroup(req, res);
});
router.post("/groupAdd", async (req, res) => {
  await chat.addToGroup(req, res);
});
router.patch("/groupRemove", async (req, res) => {
  await chat.removeFromGroup(req, res);
});
// router.delete('/removeuser', Auth);

module.exports = router;
