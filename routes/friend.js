const express =require('express');
const Auth = require('../middleware/userAuth.js');
const FriendController = require("../controllers/FriendController");
const router = express.Router();

let friend = new FriendController();

router.post('/send-invite', async (req, res)=>{
    await friend.SendInvite(req, res)
})

router.patch('/accept-invite', async (req, res)=>{
    await friend.changeStatusFriend(req, res, 2)
})

router.patch('/block-user', async (req, res)=>{
    await friend.changeStatusFriend(req, res, 3)
})

router.patch('/remove-block-user', async (req, res)=>{
    await friend.changeStatusFriend(req, res, 2)
})

router.get('/get-list-friend', async (req, res)=>{
    await friend.getListFriends(req, res)
})

router.get('/search-friend/:name', async (req, res)=>{
    await friend.searchFriend(req, res)
})

module.exports = router;
