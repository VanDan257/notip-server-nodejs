const express = require("express");
const UserController = require("../controllers/UserController.js");
const Auth = require("../middleware/userAuth.js");
const ChatController = require("../controllers/ChatController");
const router = express.Router();
// const corsOptions = {
//   origin: 'http://localhost:4200',
//   optionsSuccessStatus: 200
// };

// router.get('/auth/register', async (req, res) => {
//   await UserController.register(req, res);
// });
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
router.get("/auth/logout", async (req, res) => {
  await user.logout(req, res);
});
router.get("/api/user?", async (req, res) => {
  await user.searchUsers(req, res);
});
router.get("/api/user/:id", async (req, res) => {
  await user.getUserById(req, res);
});
router.patch("/api/user/update/:id", async (req, res) => {
  await user.updateInfo(req, res);
});
router.patch("/api/user/update-profile", async (req, res) => {
  await user.updateProfilePic(req, res);
});
module.exports = router;
