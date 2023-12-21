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
  await friend.changeStatusFriend(req, res, 2);
});

router.get("/get-list-contact/:statusContact", Auth, async (req, res) => {
  await friend.getListContacts(req, res);
});

router.get("/search-friend/:name", Auth, async (req, res) => {
  await friend.searchFriend(req, res);
});

module.exports = router;
