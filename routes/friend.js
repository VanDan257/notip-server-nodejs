const express = require("express");
const Auth = require("../middleware/userAuth.js");
const FriendController = require("../controllers/FriendController");
const router = express.Router();

let friend = new FriendController();

router.post("/send-invite", Auth, async (req, res) => {
  await friend.SendInvite(req, res);
});

router.patch("/accept-invite", Auth, async (req, res) => {
  await friend.changeStatusFriend(req, res, 2);
});

router.patch("/block-user", Auth, async (req, res) => {
  await friend.changeStatusFriend(req, res, 3);
});

router.patch("/remove-block-user", Auth, async (req, res) => {
  await friend.removeBlockUser(req, res);
});

router.get("/get-list-friend", Auth, async (req, res) => {
  await friend.getListFriends(req, res);
});

router.get("/get-list-friend-invite", Auth, async (req, res) => {
  await friend.getListFriendInvites(req, res);
});

router.get("/search-friend/:name", Auth, async (req, res) => {
  await friend.searchFriend(req, res);
});

module.exports = router;
