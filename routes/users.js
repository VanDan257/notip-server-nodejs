const express = require("express");
const UserController = require("../controllers/UserController.js");
const Auth = require("../middleware/userAuth.js");
const ChatController = require("../controllers/ChatController");
const router = express.Router();

let user = new UserController();

router.post("/account/register", async (req, res) => {
  console.log(req.body);
  await user.register(req, res);
});
router.post("/account/login", async (req, res) => {
  await user.login(req, res);
});
router.get("/auth/valid", async (req, res) => {
  await user.validUser(req, res);
});
router.get("/auth/logout", Auth, async (req, res) => {
  await user.logout(req, res);
});
router.get("/user/search/:keySearch", Auth, async (req, res) => {
  await user.searchUsers(req, res);
});
router.get("/users/profile", Auth, async (req, res) => {
  await user.getUserById(req, res);
});
router.post("/user/updateProfile", Auth, async (req, res) => {
  await user.updateInfo(req, res);
});
router.post("/user/update-avatar", Auth, async (req, res) => {
  await user.updateAvatar(req, res);
});
module.exports = router;
